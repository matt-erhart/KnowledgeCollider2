import * as React from "react";

export const Snippet = (props: snippet) =>
  <div className="stockDetail">
    <div><strong>{props.comment}</strong></div>
    <div>Snippet: {props.snippet}</div>
    <img src={props.downloadUrl} width={500} height={500} />
  </div>;


export class SnippetEntity extends React.Component<
  { snippet: snippet },
  { hovering: boolean }
> {
  state = { hovering: false };
  render() {
    return (
      <span>
        <span
          className="stockItem"
          onMouseEnter={() => this.setState({ hovering: true })}
          onMouseLeave={() => this.setState({ hovering: false })}
        >
          {this.props.children}
        </span>
        {this.state.hovering &&
          <div className="stockItemHover">
            <Snippet {...this.props.snippet} />
          </div>}
      </span>
    );
  }
}