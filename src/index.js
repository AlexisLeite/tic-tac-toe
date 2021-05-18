import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
/* import GameFlowInterface from "components/game"; */
/* import { consoleAccess } from "common";
import { Selector } from "components/common"; */
//import memoizeOne from "memoize-one";
/* import {
  PlayersService,
  ComputerPlayer,
  HumanPlayer,
  ServerCommunications,
  GameFlowService,
} from "services"; */

import Chat from "./test/chat";

const testing = true;

class Test extends React.Component {
  render() {
    return (
      <>
        <Chat />
      </>
    );
  }
}

if (testing) ReactDOM.render(<Test />, document.getElementById("root"));
/* else ReactDOM.render(<GameFlowInterface />, document.getElementById("root")); */
