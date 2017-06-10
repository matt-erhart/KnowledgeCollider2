import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Router, Route, Switch } from "react-router";
import { createBrowserHistory } from "history";
import { configureStore } from "../redux/configureStore";
import { App } from "./App";

const store = configureStore();
const history = createBrowserHistory();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
// <Router history={history}>
//   <Switch>
//     {/*<Route path="/" component={App} />*/}
//     <App></App>
//   </Switch>
// </Router>
