import * as Draft from 'draft-js'

  export const contentState = (editorState) => {
    const contentState = editorState.getCurrentContent();
    const rawJson = Draft.convertToRaw(contentState);
    const jsonStr = JSON.stringify(rawJson, null, 1);
    const plainText = contentState.getPlainText();
    return {
      jsonStr,
      plainText
    };
  }

   export const createWithPlainText = (plainText) => {
    const contentState = Draft.ContentState.createFromText(
      plainText
    );
    return Draft.EditorState.createWithContent(contentState);
  };

   export const createWithHTML = (html) => {
    const contentBlocks = Draft.convertFromHTML(html);
    const contentState = Draft.ContentState.createFromBlockArray(contentBlocks);
    return Draft.EditorState.createWithContent(contentState);
  };

   export const createWithRawContent = (rawSampleJson) => {
    const contentState = Draft.convertFromRaw(rawSampleJson);
    return Draft.EditorState.createWithContent(contentState);
  };

   export const selectionState = (editorState) => {
    // the editorState ahs a setSelection() method to get the selection
    const selectionState = editorState.getSelection();
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

    export const setSelection = (offset: number, focusOffset: number, state) => {
    const { editorState } = state;
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
    return newEditorState;
  }

  export const setEntity = (data: string, mutabilaty: string = "IMMUTABLE", state) => {
    const editorState = state.editorState;
    const contentstate = editorState.getCurrentContent();

    // the entity is created from the content state and returns the actual entety
    // we don't need the actual entety but we do need a key
    contentstate.createEntity("myEntityIdentifier", mutabilaty, {
      storedText: data
    });

    // This is how we get the key
    const entityKey = contentstate.getLastCreatedEntityKey();

    // get the current selection
    const selectionState = state.editorState.getSelection();

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
    return newEditorState
  }

  export const getEntityAtCursor = (editorState: Draft.EditorState) => {
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
      return data
    } else {
      return ''
    }
  }

  