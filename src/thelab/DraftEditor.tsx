import * as React from "react";
require("!style-loader!css-loader!draft-js-mention-plugin/lib/plugin.css"); // eslint-disable-line import/no-unresolved
import { EditorState } from "draft-js";
import Editor from "draft-js-plugins-editor"; // eslint-disable-line import/no-unresolved
import createMentionPlugin, { defaultSuggestionsFilter } from "draft-js-mention-plugin"; // eslint-disable-line import/no-unresolved
import mentions from "./mentions";
import styled from "styled-components";
import getSnippets from "./getSnippets"
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
  mentions,
  mentionComponent: props => 
    <span
      className={props.className}
      // eslint-disable-next-line no-alert
      onClick={() => alert("Clicked on the Mention!")}
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
    suggestions: mentions
  };

  onChange = editorState => {
    this.setState({
      editorState
    });
  };

  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, mentions)
    });
  };

  focus = () => {
    this.editor.focus();
  };

  componentDidMount()  {
    getSnippets.subscribe(x => console.log(x))

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
