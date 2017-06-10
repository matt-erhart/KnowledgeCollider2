import {
  createStore,
  applyMiddleware,
  combineReducers,
  compose,
  Store
} from "redux";
import { reactReduxFirebase, firebaseStateReducer } from "react-redux-firebase";
import * as firebase from "firebase/app";
import "firebase/storage";

import { logger } from "./middleware";

const firebaseConfig = {
  apiKey: "AIzaSyDOBWE5a-0bO8k_hBbfJjXlr2dfRAMfkK4",
  authDomain: "knowledgecollector-20674.firebaseapp.com",
  databaseURL: "https://knowledgecollector-20674.firebaseio.com",
  projectId: "knowledgecollector-20674",
  storageBucket: "knowledgecollector-20674.appspot.com",
  messagingSenderId: "441463277516"
};

export var fire = firebase.initializeApp(firebaseConfig);
var storageRef = fire.storage().ref();

export interface RootState {
  firebase: any;
}

export const rootReducer = combineReducers<RootState>({
  firebase: firebaseStateReducer
});

const config = {
  userProfile: "users", // firebase root where user profiles are stored
  enableLogging: false // enable/disable Firebase's database logging
};

export function configureStore(initialState?: RootState): Store<RootState> {
  const create = window.devToolsExtension
    ? window.devToolsExtension()(createStore)
    : createStore;

  const middlewares = [];
  if (process.env.NODE_ENV !== "production") {
    middlewares.push(logger);
  }

  // Add redux Firebase to compose
  const createStoreWithFirebase = compose(
    reactReduxFirebase(firebaseConfig, config)
  )(create);

  const store = createStoreWithFirebase(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  ) as Store<RootState>;

  // if (module.hot) {
  //   module.hot.accept("./redux/reducers", () => {
  //     const nextReducer = require("./redux/reducers");
  //     store.replaceReducer(nextReducer);
  //   });
  // }

  return store;
}
