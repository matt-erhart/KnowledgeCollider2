import * as React from "react";
import * as Draft from "draft-js";
import { Editor } from "react-draft-wysiwyg";
require("!style-loader!css-loader!react-draft-wysiwyg/dist/react-draft-wysiwyg.css");
// require("!style-loader!css-loader!draft-js-inline-toolbar-plugin/lib/plugin.css");

import { storageRef, dbRef } from "../../redux/configureStore";
import snippetRegexStrategy from "./snippetRegexStrategy";
import { SnippetEntity } from "./SnippetEntity";
import { SnippetEntityHoverDetails } from "./SnippetEntityHoverDetails";
import { SnippetSuggestionListInEditor } from "./SnippetSuggestionListInEditor";
import { SkyLightStateless } from "react-skylight";
import * as Rx from "rxjs";
import { SnippetList } from "./SnippetList";
import {HoverCard} from "./SnippetCard"
// import { snippetItemComponent } from "./SnippetItemComponent";
// import {createSnippetEntity} from './createSnippetEntity'

import { hexColorDecorator } from "./DecoratorWithProps";
import { snippetSortFilter } from "./snippetSortFilter";
import { contentState, createWithRawContent } from "./utils";
import { withRouter } from "react-router-dom";
import { EditorIO } from "./EditorIO";
import * as _ from "lodash";
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
  hoveredSnippet: snippet;
  mousePos: number[];
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
          <SnippetEntity
            snippet={data}
            handleHoverSnippet={this.handleHoverSnippet}
          >
            {props.children}
          </SnippetEntity>
        );
      }
      const snippetName = props.decoratedText.replace("@", "");
      return (
        <SnippetSuggestionListInEditor
          SnippetSuggestion={snippetName}
          SnippetClicked={this.createSnippetEntity}
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

  createSnippetEntity = (snippet: snippet) => {
    const selectionState = this.state.editorState.getSelection();
    var selectionStart = selectionState.getStartOffset();
    var selectionEnd = selectionState.getEndOffset();
    var anchorKey = selectionState.getAnchorKey();
    var currentContent = this.state.editorState.getCurrentContent();
    var currentContentBlock = currentContent.getBlockForKey(anchorKey);
    const text = currentContentBlock.getText();
    const start = text.search("@");
    const tmpStr = text.substring(start, text.length);
    let end = tmpStr.search("($| )");
    end = end + start;

    let partialSelection = selectionState.merge({
      anchorOffset: start,
      focusOffset: end
    }) as Draft.SelectionState;

    const noSelection = selectionStart === selectionEnd;
    const selection = noSelection ? partialSelection : selectionState;
    const newText = noSelection
      ? "-" + snippet.comment
      : text.slice(selectionStart, selectionEnd);

    const contentStateWithEntity = currentContent.createEntity(
      "stockItem",
      noSelection ? "MUTABLE" : "IMMUTABLE",
      snippet
    );

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newContnentState = Draft.Modifier.replaceText(
      contentStateWithEntity,
      selection,
      newText,
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

  handleHoverSnippet = (snippet: snippet, mousePos: number[]) => {
    
    this.setState({ hoveredSnippet: snippet, mousePos: mousePos });
  };
  componentDidMount() {
    const { key, title } = this.props.match.params;
    if (key) this.handleLoad(key);
    if (title) this.setState({ title });

    dbRef.ref("snippets").on("value", snapshot => {
      let snippets = [];
      _.map(snapshot.val(), (val: snippet, key: string) => {
        val.id = key;
        snippets.push(val);
      });
      this.setState({ snippets });
      // let val = snapshot.val();
      // val.id = snapshot.key;
      // this.setState({ snippets: this.state.snippets.concat(val) });
      //       console.log('from child added', this.state.snippets)

      // let val = snapshot.val();
      // let img = storageRef
      //   .child(val.imgPath.replace("images/", "images/thumb_"))
      //   .getDownloadURL()
      //   .then(url => {if (url) console.log('!!!!!!!!!!', url)}).catch(err=>{})

      // if (val.imgPath) {
      //   storageRef.child(val.imgPath).getDownloadURL().then(url => {
      //     val.id = snapshot.key;
      //     val.downloadUrl = url;
      //     this.setState({ snippets: this.state.snippets.concat(val) });
      //   });
      // }
    });
    dbRef.ref("draftjs").on("child_added", snapshot => {
      const session: Session = {
        title: snapshot.val().title,
        key: snapshot.key
      };
      this.setState({ sessions: this.state.sessions.concat(session) });
    });
  }
  componentWillUnmount() {
    dbRef.goOffline();
  }

  imgClick = snippet => {
    console.log("yeaa", snippet);
    this.setState({ showImage: snippet.imgUrl });
  };

  handleSortFilter(e, field) {
    this.setState({
      sortFilter: {
        ...this.state.sortFilter,
        [field]: (e.nativeEvent.srcElement as any).value
      }
    });
  }

  handleAttachEntity = snippet => {
    const selection = this.state.editorState.getSelection();
    console.log(selection, snippet);
  };

  handleSave = e => {
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
  };

  handleLoad = key => {
    console.log(key);
    dbRef.ref().child("draftjs/" + key).once("value", snapshot => {
      const draftJson = JSON.parse(snapshot.val().jsonStr);
      this.setState({ dbKey: key, title: snapshot.val().title });
      this.setState({ editorState: createWithRawContent(draftJson) });
      this.props.history.push("/" + snapshot.val().title + "/" + key);
    });
  };

  handleDeleteSession = () => {
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

  deleteSnippet = key => {
    dbRef.ref().child("snippets/" + key).remove();
    this.setState({
      snippets: this.state.snippets.filter(snippet => snippet.id !== key)
    });
  };

  setTitle = e => {
    this.setState({ title: (e.target as any).value });
  };

  render() {
    const snippets = snippetSortFilter(
      this.state.sortFilter,
      this.state.snippets
    );
    return (
      <div style={{ display: "flex", alignItems: "stretch", height: "100vh" }}>
        {_.get(this.state.mousePos, 0, 0) > 0 &&
            <div
              style={{
                position: "absolute",
                top: this.state.mousePos[1],
                left: this.state.mousePos[0],
                zIndex: 999,
                pointerEvents: 'none'
              }}
            >
              <HoverCard snippet={this.state.hoveredSnippet} />
            </div>}
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
          style={{ flex: 1, overflow: "scroll", height: '99vh' }}
          onClick={e => (this.refs.editor as any).editor.focus()}
        >
          <EditorIO
            title={this.state.title || ""}
            setTitle={this.setTitle}
            handleLoad={this.handleLoad}
            handleSave={this.handleSave}
            handleDelete={this.handleDeleteSession}
            sessions={this.state.sessions}
          />
          <Editor
            ref="editor"
            editorState={this.state.editorState}
            toolbarClassName="home-toolbar"
            wrapperClassName="home-wrapper"
            editorClassName="home-editor"
            editorStyle={{ fontFamily: "roboto" }}
            onEditorStateChange={this.editorStateChanged}
            customDecorators={this.compositeDecorator._decorators}
            placeholder={"use '@text in snippet' to search snippets "}
          />
          
        </div>
        {this.state.snippets &&
          <SnippetList
            handleImgClick={this.imgClick}
            snippets={snippets}
            handleSortFilter={this.handleSortFilter.bind(this)}
            handleAttachEntity={this.createSnippetEntity}
            deleteSnippet={this.deleteSnippet}
          />}
      </div>
    );
  }
}

export default withRouter(SnippetDecorator);
