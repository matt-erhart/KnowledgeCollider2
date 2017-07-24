import * as React from "react";
import SnippetCard from "./SnippetCard";
import TextField from "material-ui/TextField";
import * as _ from 'lodash'
export const SnippetList = ({
  snippets,
  handleImgClick,
  handleSortFilter,
  handleAttachEntity
}) => {
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
      <div style={{ display: "flex" }}>
        {_.map(['user','project', 'searchTerms'], (val, i) => {
            return (
              <TextField
              style={{ flex: 1, paddingTop: 0 }}
                key={i}
                hintText={val}
                multiLine={false}
                fullWidth={false}
                onChange={e => handleSortFilter(e, val)}

              />
            );
          })}

        {/* <input
          style={{ flex: 1 }}
          type="text"
          placeholder="user"
          onChange={e => handleSortFilter(e, "user")}
        />
        <input
          style={{ flex: 1 }}
          type="text"
          placeholder="project"
          onChange={e => handleSortFilter(e, "project")}
        />
        <input
          style={{ flex: 3 }}
          type="text"
          placeholder="searchTerms"
          onChange={e => handleSortFilter(e, "searchTerms")}
        /> */}
      </div>

      {snippets.length > 0 &&
        snippets.map((snippet, i) => {
          {
            /*console.log(snippet)*/
          }
          return (
            <div
              key={i}
              style={{ display: "flex", border: "1px solid darkgrey" }}
            >
              {/* <div style={{ flex: 0 }}>
                {snippet.downloadUrl &&
                  <img
                    onClick={e => {
                      handleImgClick(snippet);
                    }}
                    src={snippet.downloadUrl}
                    style={{
                      maxWidth: "200px",
                      maxHeight: "auto",
                      cursor: "pointer"
                    }}
                  />}
              </div> */}

              <div style={{ flex: 1 }}>
                <SnippetCard
                  snippet={snippet}
                  handleImgClick={handleImgClick}
                  handleAttachEntity={handleAttachEntity}
                />
                {/* <ul>
                  <li>
                    {" "}<b>Snippet:</b> {snippet.snippet}{" "}
                  </li>
                  <li>
                    <b>Comment:</b> {snippet.comment}{" "}
                  </li>
                  <li>
                    <b>Page Title:</b> {snippet.title}{" "}
                  </li>
                  <li>
                    {" "}<a href={snippet.url}>
                      {" "}<b>Page URL</b>{" "}
                    </a>{" "}
                  </li>
                  <li>
                    <b>User:</b> {snippet.user}{" "}
                  </li>
                  <li>
                    <b>Project:</b> {snippet.project}{" "}
                  </li>
                  <li>
                    <b>Date:</b> {snippet.created}{" "}
                  </li>
                </ul>
                */}

              </div>
            </div>
          );
        })}
    </div>
  );
};
