import * as React from "react";
// import * as TodoActions from "../redux/actions/todos";
// import * as style from "./style.css";
// import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
// import { RootState } from "../redux/reducers";
import * as _ from "lodash";
require('../../node_modules/react-grid-layout/css/styles.css');
require('../../node_modules/react-resizable/css/styles.css');

var WidthProvider = require('react-grid-layout').WidthProvider;
var ReactGridLayout = require('react-grid-layout');
ReactGridLayout = WidthProvider(ReactGridLayout);
import * as classNames from "classnames";

import {
  firebaseConnect,
  isLoaded,
  isEmpty,
  dataToJS
} from "react-redux-firebase";

export interface Snippet {
  comment: string;
  created: string; //a moment data
  imgPath: string;
  snippet: string;
  title: string;
  url: string;
  tags?: Array<string>;
}

export namespace SnippetGrid {
  export interface Props {
    snippets?: { [name: string]: Snippet };
    onLayoutChange?: Function;
    className?: string;
    items?: number;
    rowHeight?: number;
    cols?: number;
  }

  export interface State {
    layout: any
  }
}

@firebaseConnect(["/snippets"])
@connect(({ firebase }) => ({
  snippets: dataToJS(firebase, "/snippets")
}))
export class SnippetGrid extends React.Component<SnippetGrid.Props, SnippetGrid.State> {
    
  public static defaultProps: Partial<SnippetGrid.Props> = {
      className: "layout",
      items: 20,
      rowHeight: 30,
      cols: 12
  }

  constructor(props) {
    super(props);
    this.state = { layout: this.generateLayout() };
  }

  generateDOM() {
    return _.map(_.range(this.props.items), function(i) {
      return (<div key={i} style={{backgroundColor: 'black', opacity: .5}}><span className="text" >{i}</span></div>);
    });
  }

  generateLayout() {
    var p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      var y = _.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
      return {x: i * 2 % 12, y: Math.floor(i / 6) * +y, w: 2, h: y, i: i.toString()};
    });
  }

  onLayoutChange(layout) {
  // this.props.onLayoutChange(layout);
  this.setState({layout: layout});
},

   render() {
    return (
      <ReactGridLayout isResizable={true} layout={this.state.layout} onLayoutChange={this.onLayoutChange}
          {...this.props}>
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
}

// @connect(mapStateToProps, mapDispatchToProps)

// function mapStateToProps(state) {
//   return {
//     todos: state.todos
//   };
// }

// function mapDispatchToProps(dispatch) {
//   return {
//     actions: bindActionCreators(TodoActions as any, dispatch)
//   };
// }