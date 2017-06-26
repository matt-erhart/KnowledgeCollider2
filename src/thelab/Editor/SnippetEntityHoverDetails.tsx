import * as React from "react";

//on hover
export const SnippetEntityHoverDetails = (props: snippet) =>
  <div >
    <div><strong>{props.comment}</strong></div>
    <div>Created: {props.created}</div>
    <div>Snippet: {props.snippet}</div>
    <img src={props.downloadUrl} style={{ maxWidth: "500px", maxHeight: "auto" }} />
  </div>;