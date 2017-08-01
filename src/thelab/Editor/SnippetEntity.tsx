import * as React from "react";
import { SnippetEntityHoverDetails } from "./SnippetEntityHoverDetails";

interface State {
  hovering: boolean;
  x: number;
  y: number;
}

//in the editor
export class SnippetEntity extends React.Component<
  { snippet: snippet; handleHoverSnippet },
  State
> {
  state = { hovering: false, x: null, y: null };
  render() {
    return (
      <span
       onMouseEnter={() => this.setState({ hovering: true })}
          onMouseLeave={() => this.props.handleHoverSnippet({}, [0, 0])}
          onMouseMove={e => {
            const { clientX, clientY } = e.nativeEvent;
            this.props.handleHoverSnippet(this.props.snippet, [
              clientX,
              clientY
            ]);
            this.setState({ x: screenX, y: screenY });
          }}
      >
        <span
          style={{ color: "blue" }}
          className="stockItem"
         
        >
          {this.props.children}
        </span>
        {/* {this.state.hovering &&
          <div style={{position: 'absolute', zIndex: 999}}
          >
            <SnippetEntityHoverDetails x={this.state.x} y={this.state.y} {...this.props.snippet} />
          </div>} */}
      </span>
    );
  }
}
