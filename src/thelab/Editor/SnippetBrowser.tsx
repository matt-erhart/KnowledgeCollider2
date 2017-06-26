import * as React from "react";

const snippetList = ({ snippets }) =>
  snippets.map(snippet => {
    return (
      <div style={{ display: "flex", border: "1px solid darkgrey" }}>
        <div style={{ flex: 0 }}>
          <img
            src={snippet.downloadUrl}
            style={{ maxWidth: "200px", maxHeight: "auto" }}
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
  });

 interface snippetFilter {
    snippet?: string;
    comment?: string;
    title?: string;
    goal?: string;
    beforeDate?: string;
    afterDate?: string;
 }

  const snippetFilter = (snippets: snippet[], filter: snippetFilter) => {
      //search all
      //only comment, title, snippet, goal
      //filter date
      
  }
