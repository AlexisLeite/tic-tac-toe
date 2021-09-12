import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import GameFlowInterface from "components/game";
import { consoleAccess } from "common";
import { Selector } from "components/common";
import memoizeOne from "memoize-one";
import {
  PlayersService,
  ComputerPlayer,
  HumanPlayer,
  ServerCommunications,
  GameFlowService,
} from "services";

ReactDOM.render(<GameFlowInterface />, document.getElementById("root"));
