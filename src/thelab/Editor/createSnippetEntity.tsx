import * as Draft from "draft-js";

export const createSnippetEntity = (snippet: snippet) => {
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
      noSelection? "MUTABLE" : "IMMUTABLE",
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