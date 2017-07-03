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

import highlight from "./highlight";
const highlightPlugin = highlight({
  background: "purple"
});

interface SnippetDecoratorState {
  editorState: Draft.EditorState;
  snippets: snippet[];
  showImage: string;
  sortFilter: { searchTerms: string; project: string; user: string };
}

export class SnippetDecorator extends React.Component<
  null,
  SnippetDecoratorState
> {
  editor;
  compositeDecorator;
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

    this.state = {
      editorState: Draft.EditorState.createEmpty(hexColorDecorator),
      snippets: [],
      showImage: "",
      sortFilter: { searchTerms: "", project: "", user: "" }
    };
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
      snippet.comment,
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

  editorStateChanged = newEditorState =>
    this.setState({ editorState: newEditorState });

  componentDidMount() {
    // dbRef.ref("snippets").on("child_added", snapshot => {
    //   const newSnippet = snapshot.val();
    //   this.setState({ snippets: this.state.snippets.concat(newSnippet) });
    // });
    dbRef.ref("snippets").on("child_added", snapshot => {
      let val = snapshot.val();
      storageRef.child(val.imgPath).getDownloadURL().then(url => {
        val.id = snapshot.key;
        val.downloadUrl = url;
        this.setState({ snippets: this.state.snippets.concat(val) });
        // const snippets = snippetSortFilter(
        //   sortFilterConfig,
        //   this.state.snippets
        // );
        // this.setState({ filteredSnippets: snippets, isOpened: true });
      });
    });
  }

  imgClick(snippet) {
    this.setState({ showImage: snippet.downloadUrl });
  }
  handleSortFilter(e, field) {
    this.setState({sortFilter: {...this.state.sortFilter, [field]: (e.nativeEvent.srcElement as any).value}})
  }

  render() {
console.log(this.state)
    const snippets = snippetSortFilter(this.state.sortFilter, this.state.snippets)
    console.log(snippets)
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
          {/*<Editor
             ref='editor'
            editorState={this.state.editorState}
            onChange={this.editorStateChanged}
            decorators={[hexColorDecorator]}
          />*/}
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
