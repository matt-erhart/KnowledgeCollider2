import * as React from "react";
import SnippetCard from "./SnippetCard";
import TextField from "material-ui/TextField";
import * as _ from 'lodash'
export const SnippetList = ({
  snippets,
  handleImgClick,
  handleSortFilter,
  handleAttachEntity,
  deleteSnippet
}) => {
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
      </div>

      {snippets.length > 0 &&
        snippets.map((snippet, i) => {
          console.log('from list', snippet)
          return (
            <div
              key={i + snippet.id}
              style={{ display: "flex", border: "1px solid darkgrey" }}
            >
              <div style={{ flex: 1 }}>
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  handleImgClick={handleImgClick}
                  handleAttachEntity={handleAttachEntity}
                  deleteSnippet={deleteSnippet}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
};
