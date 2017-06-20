import * as React from "react";
require("!style-loader!css-loader!draft-js-mention-plugin/lib/plugin.css"); // eslint-disable-line import/no-unresolved
import { EditorState } from "draft-js";
import Editor from "draft-js-plugins-editor"; // eslint-disable-line import/no-unresolved
import createMentionPlugin, { defaultSuggestionsFilter } from "draft-js-mention-plugin"; // eslint-disable-line import/no-unresolved
// import mentions from "./mentions";
import styled from "styled-components";
import getSnippets from "../getSnippets";
import { fromJS } from "immutable";

const EditorCss = styled.div`
box-sizing: border-box;
  border: 1px solid #ddd;
  cursor: text;
  padding: 16px;
  border-radius: 2px;
  margin-bottom: 2em;
  box-shadow: inset 0px 1px 8px -3px #ABABAB;
  background: #fefefe;
  &:global(.public-DraftEditor-content) {
  min-height: 140px;
  }
`;

const mentionPlugin = createMentionPlugin({
  // mentions,
  mentionComponent: props =>
    <span
      className={props.className}
      // eslint-disable-next-line no-alert
      onClick={e => {
        const text = e.nativeEvent.srcElement.textContent;
      }}
    >
      {props.children}
    </span>
});
const { MentionSuggestions } = mentionPlugin;
const plugins = [mentionPlugin];

export default class CustomMentionEditor extends React.Component<any, any> {
  editor;
  state = {
    editorState: EditorState.createEmpty(),
    suggestions: {},
    snippets: {}
  };

  onChange = editorState => {
    this.setState({
      editorState
    });
  };

  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, this.state.snippets, 10)
    });
  };

  focus = () => {
    this.editor.focus();
  };

  componentDidMount() {
    getSnippets.take(1).subscribe(snippets => {
      let snipsForSuggestions = [];
      snippets.forEach(snip => {
        snipsForSuggestions.push({
          name: snip.snippet,
          link: snip.url,
          avatar: snip.downloadUrl
        });
      });
      this.setState({ snippets: fromJS(snipsForSuggestions) });
    });
  }

  render() {
    return (
      <EditorCss className="editor" onClick={this.focus}>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          plugins={plugins}
          ref={element => {
            this.editor = element;
          }}
        />
        <MentionSuggestions
          onSearchChange={this.onSearchChange}
          suggestions={this.state.suggestions}
        />
      </EditorCss>
    );
  }
}
