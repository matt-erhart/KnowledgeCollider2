import * as React from "react";
import * as Draft from "draft-js";
import getSnippets from "../getSnippets";
import { Editor } from "react-draft-wysiwyg";
require("!style-loader!css-loader!react-draft-wysiwyg/dist/react-draft-wysiwyg.css"); // eslint-disable-line import/no-unresolved
import { storageRef, dbRef } from "../../redux/configureStore";
import snippetRegexStrategy from "./snippetRegexStrategy";
import { SnippetEntity } from "./SnippetEntity";
import { SnippetEntityHoverDetails } from "./SnippetEntityHoverDetails";
import { SnippetSuggestionListInEditor } from "./SnippetSuggestionListInEditor";
import { SkyLightStateless } from "react-skylight";

interface SnippetDecoratorState {
  editorState: Draft.EditorState;
  snippets: snippet[];
  showImage: string;
}

export class SnippetDecorator extends React.Component<
  null,
  SnippetDecoratorState
> {
  compositeDecorator;
  constructor(props: any) {
    super(props);
    //get entity data and pass to snippetentity
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
      const snippetName = props.decoratedText.replace("s:", "");
      console.log('snipopetname',snippetName)
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
      editorState: Draft.EditorState.createEmpty(this.compositeDecorator),
      snippets: [],
      showImage: ""
    };
  }

  snippetClicked = (snippet: snippet) => {
    const selectionState = this.state.editorState.getSelection();
    var anchorKey = selectionState.getAnchorKey();
    var currentContent = this.state.editorState.getCurrentContent();
    var currentContentBlock = currentContent.getBlockForKey(anchorKey);
    const text = currentContentBlock.getText();
    const start = text.search("s:");
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
    // (this.refs["editor"] as any).focus();
    getSnippets.take(1).subscribe(snippets => {
      this.setState({ snippets });
    });
    dbRef.ref("snippets").on("child_added", snapshot => {
      const newSnippet = snapshot.val();
      this.setState({ snippets: this.state.snippets.concat(newSnippet) });
    });
    // document.addEventListener("keydown", e =>{
    //   console.log(e)
    // })
  }
  render() {
    const { snippets } = this.state;
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
            placeholder={"use 's:text in snippet' to search snippets "}
          />
        </div>

        <div
          style={{
            flex: 1,
            borderColor: "black",
            overflow: "scroll",
            border: "1px solid black"
          }}
        >
          {snippets &&
            snippets.map((snippet,i) => {
              return (
                <div
                  key={i}
                  style={{ display: "flex", border: "1px solid darkgrey" }}
                >
                  <div style={{ flex: 0 }}>
                    <img
                      onClick={e => {
                        this.setState({ showImage: snippet.downloadUrl });
                      }}
                      src={snippet.downloadUrl}
                      style={{
                        maxWidth: "200px",
                        maxHeight: "auto",
                        cursor: "pointer"
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <ul>
                      <li> <b>Snippet:</b>   {snippet.snippet} </li>
                      <li><b>Comment:</b> {snippet.comment} </li>
                      <li><b>Page Title:</b> {snippet.title} </li>
                      <li>
                        {" "}<a href={snippet.url}> <b>Page URL</b> </a>{" "}
                      </li>
                      <li><b>Goal:</b> {snippet.goal} </li>
                      <li><b>Date:</b> {snippet.created} </li>
                    </ul>
                  </div>
                </div>
              );
            })}

        </div>
      </div>
    );
  }
}
