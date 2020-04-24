import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "antd/dist/antd.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Store from "./store/store";
import HttpsRedirect from "react-https-redirect";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

ReactDOM.render(
  <HttpsRedirect>
    <Provider store={Store}>
      <App />
    </Provider>
  </HttpsRedirect>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
