import * as React from "react";
import ReactHtmlParser from "react-html-parser";

//todo: move hightlight out
export const Highlight = (text, term) => {
  const html = text
    .toLowerCase()
    .replace(
      term.toLowerCase(),
      `<b style="background:lightgreen; border-radius:4px">${term.toLowerCase()}</b>`
    );

  return ReactHtmlParser(`<span>${html}</span>`);
};

//on hover
export const SnippetEntityHoverDetails = props =>
  <div>
    <div><strong>{Highlight(props.comment, props.searchTerm)}</strong></div>
    <div>Created: {props.created}</div>
    <div>Snippet: {Highlight(props.snippet, props.searchTerm)}</div>
    <div>Goal: {Highlight(props.goal || '', props.searchTerm)}</div>
    <div>Title: {Highlight(props.title || '', props.searchTerm)}</div>
    <img
      src={props.downloadUrl}
      style={{ maxWidth: "500px", maxHeight: "auto" }}
    />
  </div>;
