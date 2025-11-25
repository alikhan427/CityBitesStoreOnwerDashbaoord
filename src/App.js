// src/App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import AppRouting from "./routing/AppRouting";

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRouting />
      </Router>
    </Provider>
  );
}
