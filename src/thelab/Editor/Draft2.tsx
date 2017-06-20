import * as React from "react";
import * as Draft from "draft-js";
const rawSampleJson = require("./draft.json");

const regexStratergy = (block: Draft.ContentBlock, callback: (start: number, end: number) => void) => {
    const text = block.getText();
    let result: RegExpExecArray;
    let regex = /(^|\s)#\w+/g;
    while ((result = regex.exec(text) as RegExpExecArray) != null) {
        let start = result.index;
        let end = start + result[0].length;
        callback(start, end);
    }
};

const regexComponent = (props) => <span style={{ backgroundColor: 'lightgreen' }}>{props.children}</span>;

const compositeDecorator = new Draft.CompositeDecorator([
    {
        strategy: regexStratergy,
        component: regexComponent
    }
]);

interface State {
    editorState: Draft.EditorState;
    retrievedData: string;
}

export class Simple extends React.Component<
  null,
  State
> {
  state = {
    editorState: Draft.EditorState.createEmpty(compositeDecorator),
    plainText: "This is a plain string of text",
    html: "<h1>Header</h1> <b>Bold text</b>, <i>Italic text</i><br/ ><br />",
    retrievedData: ""
  };

  editorStateChanged = (newEditorState: Draft.EditorState) => {
    this.setState({ editorState: newEditorState });
    this.getEntityAtCursor(newEditorState);
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

  setSelection(offset: number, focusOffset: number) {
    const { editorState } = this.state;
    const selectionState = editorState.getSelection();

    // we cant set the selection state directly because its immutable.
    // so make a copy
    const newSelection = selectionState.merge({
      anchorOffset: Math.round(offset),
      focusOffset: Math.round(focusOffset)
    }) as Draft.SelectionState;

    // Draft API helper set the selection into a new editorState
    const newEditorState = Draft.EditorState.forceSelection(
      editorState,
      newSelection
    );

    // update the editorState
    this.editorStateChanged(newEditorState);
  }

  setEntity(data: string, mutabilaty: string = "IMMUTABLE") {
    const editorState = this.state.editorState;
    const contentstate = editorState.getCurrentContent();

    // the entity is created from the content state and returns the actual entety
    // we don't need the actual entety but we do need a key
    contentstate.createEntity("myEntityIdentifier", mutabilaty, {
      storedText: data
    });

    // This is how we get the key
    const entityKey = contentstate.getLastCreatedEntityKey();

    // get the current selection
    const selectionState = this.state.editorState.getSelection();

    // associate the text in the selection (from - to) to the entety and get a new content state
    const newContentState = Draft.Modifier.applyEntity(
      contentstate,
      selectionState,
      entityKey
    );

    // add the new content state to the existing editor state and return a new editorstate
    const newEditorState = Draft.EditorState.push(
      this.state.editorState,
      newContentState,
      "apply-entity"
    );

    // update the Edit controll
    this.editorStateChanged(newEditorState);
  }

  getEntityAtCursor = (editorState: Draft.EditorState) => {
    const selectionState = editorState.getSelection();
    const selectionKey = selectionState.getStartKey();
    const contentstate = editorState.getCurrentContent();

    // get the block where the cursor is
    const block = contentstate.getBlockForKey(selectionKey);

    // get the Entity key at the where the cursor is
    const entityKey = block.getEntityAt(selectionState.getStartOffset());
    if (entityKey) {
      // use the following method to get the entity instance
      const entityInstance = contentstate.getEntity(entityKey);
      const data = entityInstance.getData().storedText;
      this.setState({ retrievedData: data}); //@ts-ignore
    } else {
      this.setState({ retrievedData: '' });
    }
  }

  render() {
    return (
      <div>
          <span>Clicked entity: {this.state.retrievedData}</span>
        <div className="editor" style={{ backgroundColor: "grey" }}>
          <Draft.Editor
            editorState={this.state.editorState}
            onChange={this.editorStateChanged}
          />
        </div>
        <div>
          <button
            className="btn btn-default"
            onClick={() => this.setEntity("concept", "IMMUTABLE")}
          >
            Set as concept
          </button>

          <button
            className="btn btn-default"
            onClick={() => this.setEntity("linking phrase", "IMMUTABLE")}
          >
            Set as linking phrase
          </button>

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
            <button
            onClick={e => {
              this.setSelection(Math.random() * 15, Math.random() * 15);
            }}
          >
            Random Selection
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
          
        </div>
      </div>
    );
  }
}
