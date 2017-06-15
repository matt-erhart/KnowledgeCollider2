import * as React from "react";
import * as Draft from "draft-js";
const rawSampleJson = require("./draft.json");

export class Simple extends React.Component<
  null,
  { editorState: Draft.EditorState }
> {
  state = {
    editorState: Draft.EditorState.createEmpty(),
    plainText: "This is a plain string of text",
    html: "<h1>Header</h1> <b>Bold text</b>, <i>Italic text</i><br/ ><br />"
  };

  editorStateChanged = (newEditorState: Draft.EditorState) => {
    this.setState({ editorState: newEditorState });
  };

  contentState() {
    const contentState = this.state.editorState.getCurrentContent();
    const rawJson = Draft.convertToRaw(contentState);
    const jsonStr = JSON.stringify(rawJson, null, 1);
    const plainText = contentState.getPlainText();
    return {
      jsonStr,
      plainText
    };
  }

  createWithPlainText = () => {
    const contentState = Draft.ContentState.createFromText(
      this.state.plainText
    );
    const newEditorState = Draft.EditorState.createWithContent(contentState);
    this.setState({ editorState: newEditorState });
  };

  createWithHTML = () => {
    const contentBlocks = Draft.convertFromHTML(this.state.html);
    const contentState = Draft.ContentState.createFromBlockArray(contentBlocks);
    const newEditorState = Draft.EditorState.createWithContent(contentState);
    this.setState({ editorState: newEditorState });
  };

  createWithRawContent = () => {
    const contentState = Draft.convertFromRaw(rawSampleJson);
    const newEditorState = Draft.EditorState.createWithContent(contentState);
    this.editorStateChanged(newEditorState);
  };

  selectionState() {
    // the editorState ahs a setSelection() method to get the selection
    const selectionState = this.state.editorState.getSelection();

    // sample of some data we can get from the selection state
    const offset = selectionState.getAnchorOffset();
    const focusOffset = selectionState.getFocusOffset();
    const isBackwards = selectionState.getIsBackward();
    return {
      offset,
      focusOffset,
      isBackwards
    };
  }

  setSelection(offset: number, focusOffset: number)  {
        const {editorState} = this.state;
        const selectionState = editorState.getSelection();

        // we cant set the selection state directly because its immutable.
        // so make a copy  
        const newSelection = selectionState.merge({
            anchorOffset: Math.round(offset),
            focusOffset: Math.round(focusOffset),
        }) as Draft.SelectionState;

        // Draft API helper set the selection into a new editorState
        const newEditorState = Draft.EditorState.forceSelection(editorState, newSelection);

        // update the editorState 
        this.editorStateChanged(newEditorState);
    }

  render() {
    return (
      <div>
        <div className="editor" style={{ backgroundColor: "grey" }}>
          <Draft.Editor
            editorState={this.state.editorState}
            onChange={this.editorStateChanged}
          />
        </div>

        <div className="row">
          <div className="col-sm-6">
            <button
              onClick={e => {
                this.createWithRawContent();
              }}
            >
              create from raw
            </button>
            <button
              onClick={e => {
                this.createWithHTML();
              }}
            >
              create from html
            </button>
            <button
              onClick={e => {
                this.createWithPlainText();
              }}
            >
              create from plain text
            </button>

            <pre>{this.contentState().jsonStr}</pre>
          </div>
          <div className="col-sm-6">
            Raw Text View
            <div>{this.contentState().plainText}</div>
          </div>
          <div>
            offset {this.selectionState().offset}
            focusOffset {this.selectionState().focusOffset}
            isBackwards {this.selectionState().isBackwards ? "yes" : "no"}
          </div>
          <button onClick={e=>{this.setSelection(Math.random()*15,Math.random()*15)}}>Random Selection</button>
        </div>
      </div>
    );
  }
}
