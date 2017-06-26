import * as React from "react";
import {SnippetEntityHoverDetails} from './SnippetEntityHoverDetails'

//in the editor
export class SnippetEntity extends React.Component<
  { snippet: snippet },
  { hovering: boolean }
> {
  state = { hovering: false };
  render() {
    return (
      <span>
        <span style={{color: 'blue'}}
          className="stockItem"
          onMouseEnter={() => this.setState({ hovering: true })}
          onMouseLeave={() => this.setState({ hovering: false })}
        >
          {this.props.children}
        </span>
        {this.state.hovering &&
          <div className="stockItemHover">
            <SnippetEntityHoverDetails {...this.props.snippet} />
          </div>}
      </span>
    );
  }
}