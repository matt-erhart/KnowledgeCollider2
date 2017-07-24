import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { configureStore } from "../redux/configureStore";
import { App } from "./App";
import { BrowserRouter as Router, Route, Switch, RouteComponentProps } from 'react-router-dom';
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();
const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <Router>
          <Route path="/:title?/:key?" component={App}/>
    </Router>
  </Provider>,
  document.getElementById("root")
);
