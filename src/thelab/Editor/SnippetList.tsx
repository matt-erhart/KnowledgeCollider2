import * as React from "react";

export const SnippetList = ({ snippets, handleImgClick }) => {
  // console.log(snippets, handleImgClick)
  return (
    <div
      style={{
        flex: 1,
        borderColor: "black",
        overflow: "scroll",
        border: "1px solid black"
      }}
    >
      {snippets.length > 0 &&
        snippets.map((snippet, i) => {
          {/*console.log(snippet)*/}
          return (
            <div
              key={i}
              style={{ display: "flex", border: "1px solid darkgrey" }}
            >
              <div style={{ flex: 0 }}>
                {snippet.downloadUrl && <img
                  onClick={(e) =>{
                  handleImgClick(snippet)}
                  }
                  src={snippet.downloadUrl}
                  style={{
                    maxWidth: "200px",
                    maxHeight: "auto",
                    cursor: "pointer"
                  }}
                />}
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
  );
};
