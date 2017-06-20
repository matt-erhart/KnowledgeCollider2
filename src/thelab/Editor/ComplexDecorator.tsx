import * as React from "react";
import * as Draft from "draft-js";
import getSnippets from "../getSnippets";
import { Editor } from "react-draft-wysiwyg";
require("!style-loader!css-loader!react-draft-wysiwyg/dist/react-draft-wysiwyg.css"); // eslint-disable-line import/no-unresolved
import { storageRef, dbRef } from "../../redux/configureStore";
import snippetRegexStrategy from "./snippetRegexStrategy";
import { SnippetEntity, Snippet } from "./SnippetEntity";
import { SnippetSuggestion } from "./SnippetSuggestions";

interface ComplexDecoratorState {
  editorState: Draft.EditorState;
  snippets: snippet[];
}

export class ComplexDecorator extends React.Component<
  null,
  ComplexDecoratorState
> {
  compositeDecorator;
  constructor(props: any) {
    super(props);
    // tslint:disable-next-line:no-shadowed-variable
    const stockItemComponent = (props: {
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
      return (
        <SnippetSuggestion
          SnippetSuggestion={snippetName}
          SnippetClicked={this.snippetClicked}
        >
          {props.children}
        </SnippetSuggestion>
      );
    };

    this.compositeDecorator = new Draft.CompositeDecorator([
      {
        strategy: snippetRegexStrategy,
        component: stockItemComponent
      }
    ]);

    this.state = {
      editorState: Draft.EditorState.createEmpty(this.compositeDecorator),
      snippets: []
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
  }
  render() {
    return (
      <div
        className="editor"
        style={{ display: "flex", alignItems: "stretch" }}
      >
        <div
          style={{ flex: 1, minHeight: "100vh" }}
          onClick={e => {
            {
              /*(this.refs["editor"] as any).focus();*/
            }
          }}
        >
          {/*<Draft.Editor
            style={{ flex: 1, minHeight: "100vh" }}
            placeHolder={":"}
            ref="editor"
            editorState={this.state.editorState}
            onChange={this.editorStateChanged}
          />*/}
          <Editor
            editorState={this.state.editorState}
            toolbarClassName="home-toolbar"
            wrapperClassName="home-wrapper"
            editorClassName="home-editor"
            onEditorStateChange={this.editorStateChanged}
            customDecorators={this.compositeDecorator._decorators}
          />

        </div>
      </div>
    );
  }
}
