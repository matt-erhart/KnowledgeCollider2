import * as React from "react";
import * as Draft from "draft-js";
import getSnippets from "../getSnippets";
import { Editor } from "react-draft-wysiwyg";
require("!style-loader!css-loader!react-draft-wysiwyg/dist/react-draft-wysiwyg.css"); // eslint-disable-line import/no-unresolved
// require("!style-loader!css-loader!draft-js-inline-toolbar-plugin/lib/plugin.css");

import { storageRef, dbRef } from "../../redux/configureStore";
import snippetRegexStrategy from "./snippetRegexStrategy";
import { SnippetEntity } from "./SnippetEntity";
import { SnippetEntityHoverDetails } from "./SnippetEntityHoverDetails";
import { SnippetSuggestionListInEditor } from "./SnippetSuggestionListInEditor";
import { SkyLightStateless } from "react-skylight";
import * as Rx from "rxjs";
import { SnippetList } from "./SnippetList";
// import Editor from "draft-js-plugins-editor"; // eslint-disable-line import/no-unresolved
import createInlineToolbarPlugin from "draft-js-inline-toolbar-plugin";
const inlineToolbarPlugin = createInlineToolbarPlugin();
const { InlineToolbar } = inlineToolbarPlugin;
const plugins = [inlineToolbarPlugin];
import { hexColorDecorator } from "./DecoratorWithProps";
import { snippetSortFilter } from "./snippetSortFilter";
import { contentState, createWithRawContent } from "./utils";
import { Route, Switch, Link, Redirect, withRouter } from "react-router-dom";
import highlight from "./highlight";
const highlightPlugin = highlight({
  background: "purple"
});
interface Session {
  title: string;
  key: string;
}
interface SnippetDecoratorState {
  editorState: Draft.EditorState;
  snippets: snippet[];
  showImage: string;
  sortFilter: { searchTerms: string; project: string; user: string };
  dbKey: string;
  title: string;
  sessions: Session[];
}

class FirebaseKeyThenLink extends React.Component<null, { key: string }> {
  componentWillMount() {
    this.setState({ key: dbRef.ref().child("draftjs").push().key });
  }

  render() {
    return (
      <div>
        {this.state.key}
      </div>
    );
  }
}

class SnippetDecorator extends React.Component<any, SnippetDecoratorState> {
  editor;
  compositeDecorator;
  defaultState;
  constructor(props: any) {
    super(props);

    const snippetItemComponent = (props: {
      decoratedText: string;
      entityKey: string;
      children: any;
    }) => {
      if (props.entityKey) {
        //key content entity get data show
        var currentContent = this.state.editorState.getCurrentContent();
        const instance = currentContent.getEntity(props.entityKey);
        const data = instance.getData() as snippet;
        return (
          <SnippetEntity snippet={data}>
            {props.children}
          </SnippetEntity>
        );
      }
      const snippetName = props.decoratedText.replace("@", "");
      return (
        <SnippetSuggestionListInEditor
          SnippetSuggestion={snippetName}
          SnippetClicked={this.snippetClicked}
        >
          {props.children}
        </SnippetSuggestionListInEditor>
      );
    };

    this.compositeDecorator = new Draft.CompositeDecorator([
      {
        strategy: snippetRegexStrategy,
        component: snippetItemComponent
      }
    ]);

    this.defaultState = {
      editorState: Draft.EditorState.createEmpty(hexColorDecorator),
      snippets: [],
      showImage: "",
      sortFilter: { searchTerms: "", project: "", user: "" },
      dbKey: "",
      title: "",
      sessions: []
    };
    this.state = this.defaultState;
  }

  snippetClicked = (snippet: snippet) => {
    const selectionState = this.state.editorState.getSelection();
    var anchorKey = selectionState.getAnchorKey();
    var currentContent = this.state.editorState.getCurrentContent();
    var currentContentBlock = currentContent.getBlockForKey(anchorKey);
    const text = currentContentBlock.getText();
    const start = text.search("@");
    const tmpStr = text.substring(start, text.length);
    let end = tmpStr.search("($| )");
    end = end + start;

    const partialSelection = selectionState.merge({
      anchorOffset: start,
      focusOffset: end
    }) as Draft.SelectionState;

    const contentStateWithEntity = currentContent.createEntity(
      "stockItem",
      "MUTABLE",
      snippet
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newContnentState = Draft.Modifier.replaceText(
      contentStateWithEntity,
      partialSelection,
      snippet.comment || 'Snippet',
      undefined,
      entityKey
    );
    const newEditorState = Draft.EditorState.push(
      this.state.editorState,
      newContnentState,
      "insert-characters"
    );
    const editorStateToUpdate = Draft.EditorState.forceSelection(
      newEditorState,
      newContnentState.getSelectionAfter()
    );

    this.setState({ editorState: editorStateToUpdate });
  };

  editorStateChanged = newEditorState => {
    this.setState({ editorState: newEditorState });
  };

  componentDidMount() {
    if (this.props.match.params.key) {
      this.handleLoad(this.props.match.params.key);
    }
    if (this.props.match.params.title) {
      this.setState({ title: this.props.match.params.title });
    }
    dbRef.ref("snippets").on("child_added", snapshot => {
      let val = snapshot.val();
      if (val.imgPath) {
        storageRef.child(val.imgPath).getDownloadURL().then(url => {
          val.id = snapshot.key;
          val.downloadUrl = url;
          this.setState({ snippets: this.state.snippets.concat(val) });
        });
      }
    });
    dbRef.ref("draftjs").on("child_added", snapshot => {
      const session: Session = {
        title: snapshot.val().title,
        key: snapshot.key
      };
      this.setState({ sessions: this.state.sessions.concat(session) });
    });
  }

  imgClick(snippet) {
    this.setState({ showImage: snippet.downloadUrl });
  }
  handleSortFilter(e, field) {
    this.setState({
      sortFilter: {
        ...this.state.sortFilter,
        [field]: (e.nativeEvent.srcElement as any).value
      }
    });
  }
  handleSave(e) {
    let serializedState = contentState(this.state.editorState);
    (serializedState as any).title = this.state.title;
    const urlAndTitleStateTheSame =
      this.state.title === this.props.match.params.title;

    if (this.state.dbKey && urlAndTitleStateTheSame) {
      dbRef.ref().child("draftjs/" + this.state.dbKey).set(serializedState);
    } else {
      const key = dbRef.ref().child("draftjs").push(serializedState).key;
      this.props.history.push("/" + this.state.title + "/" + key);
      this.setState({ dbKey: key });
    }
  }

  handleLoad = key => {
    dbRef.ref().child("draftjs/" + key).once("value", snapshot => {
      const draftJson = JSON.parse(snapshot.val().jsonStr);
      this.setState({ dbKey: key });
      this.setState({ title: snapshot.val().title });
      this.setState({ editorState: createWithRawContent(draftJson) });
      this.props.history.push("/" + snapshot.val().title + "/" + key);
    });
  };
  deleteSession = () => {
    dbRef.ref().child("draftjs/" + this.state.dbKey).remove();
    this.setState({
      editorState: Draft.EditorState.createEmpty(hexColorDecorator),
      sessions: this.state.sessions.filter(
        session => session.key !== this.state.dbKey
      )
    });
    this.setState({ dbKey: "", title: "" });
    this.props.history.push("/");
  };

  render() {
    const snippets = snippetSortFilter(
      this.state.sortFilter,
      this.state.snippets
    );
    return (
      <div style={{ display: "flex", alignItems: "stretch", height: "100vh" }}>
        <SkyLightStateless
          hideOnOverlayClicked
          dialogStyles={{
            width: "90%",
            height: "90%",
            left: "2%",
            top: "2%",
            marginTop: "0",
            marginLeft: "0",
            overflow: "scroll"
          }}
          isVisible={this.state.showImage.length > 0}
          onCloseClicked={() => {
            this.setState({ showImage: "" });
          }}
        >
          <img src={this.state.showImage} style={{}} />
        </SkyLightStateless>
        <div
          className="home-wrapper"
          style={{ flex: 1 }}
          onClick={e => (this.refs.editor as any).editor.focus()}
        >
          <a href="https://github.com/matt-erhart/KCExtension/tree/master/build">
            Updated Chrome Extension Build
          </a>
          <form
            onSubmit={e => {
              e.preventDefault();
              this.handleSave(e);
            }}
          >
            <button type="submit" style={{ marginLeft: "5px" }}>
              Save
            </button>
            <input
              type="text"
              placeholder="url safe title"
              name="title"
              onChange={e => this.setState({ title: e.target.value })}
              value={this.state.title}
              onClick={e => e.stopPropagation()}
            />
          </form>
          
            <select
            onClick={e => e.stopPropagation()}
            value={this.state.dbKey}
            onChange={e => this.handleLoad(e.target.value)}
          >
           <option disabled> -- load session -- </option>
            {(this.state.sessions && this.state.sessions.length > 0) &&
              this.state.sessions.map((session, i) => {
                return (
                  <option key={i} value={session.key}>
                    {session.title}
                  </option>
                );
              })}
              </select>
          
          <button onClick={e => this.deleteSession()}>Delete</button>
          <Editor
            ref="editor"
            editorState={this.state.editorState}
            toolbarClassName="home-toolbar"
            wrapperClassName="home-wrapper"
            editorClassName="home-editor"
            onEditorStateChange={this.editorStateChanged}
            customDecorators={this.compositeDecorator._decorators}
            placeholder={"use '@text in snippet' to search snippets "}
          />
        </div>
        {this.state.snippets &&
          <SnippetList
            handleImgClick={this.imgClick.bind(this)}
            snippets={snippets}
            handleSortFilter={this.handleSortFilter.bind(this)}
          />}
      </div>
    );
  }
}

export default withRouter(SnippetDecorator);
