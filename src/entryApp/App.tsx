import * as React from "react";
// import * as TodoActions from "../redux/actions/todos";
// import * as style from "./style.css";
// import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
// import { RootState } from "../redux/reducers";
// import { Header, MainSection } from "../components";
import { SnippetGrid } from "../thelab/SnippetBrowser/SnippetGrid";
import {SnippetDecorator} from "../thelab/Editor/SnippetDecorator";
export namespace App {
  export interface Props {
    // todos: TodoItemData[];
    // actions: typeof TodoActions;
  }

  export interface State {
    /* empty */
  }
}

// @connect(mapStateToProps, mapDispatchToProps)
export class App extends React.Component<null, null> {
  render() {
    return (
      <div>
      <SnippetDecorator/>

      </div>
    );
  }
}

// function mapStateToProps(state: RootState) {
//   return {
//     todos: state.todos
//   };
// }

// function mapDispatchToProps(dispatch) {
//   return {
//     actions: bindActionCreators(TodoActions as any, dispatch)
//   };
// }
