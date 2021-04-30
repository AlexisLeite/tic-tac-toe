import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/layout/layout";
import Nav from "./components/nav";
import "./index.css";
import { GameInterface } from "./components/game/interface/gameInterface";

ReactDOM.render(
  <React.StrictMode>
    <Layout aside={<Nav />}>
      <GameInterface />
    </Layout>
  </React.StrictMode>,
  document.getElementById("root")
);
