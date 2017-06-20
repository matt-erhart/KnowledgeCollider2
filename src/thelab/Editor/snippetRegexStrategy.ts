import * as Draft from "draft-js";

export default (
  block: Draft.ContentBlock,
  callback: (start: number, end: number) => void,
  contentState
) => {
  block.findEntityRanges(
    val => {
      const entityKey = val.getEntity();
      if (!entityKey) {
        return false;
      }
      return contentState.getEntity(entityKey).getType() === "stockItem";
    },
    (start, end) => callback(start, end)
  );

  const text = block.getText();
  let result: RegExpExecArray;
  let regex = /(^|\s)s:\w+/g;
  while ((result = regex.exec(text) as RegExpExecArray) != null) {
    let start = result.index;
    let end = start + result[0].length;
    callback(start, end);
  }
};
