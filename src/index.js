import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import GameFlowInterface from "components/game";
import { consoleAccess } from "common";
import { Selector } from "components/common";
//import memoizeOne from "memoize-one";
import {
  PlayersService,
  ComputerPlayer,
  HumanPlayer,
  ServerCommunications,
  GameFlowService,
} from "services";

const testing = false;

consoleAccess("q", {
  ComputerPlayer,
  HumanPlayer,
  PlayersService,
  ServerCommunications,
  GameFlowService,
});

class Test extends React.Component {
  constructor(props) {
    super(props);

    PlayersService.onMainPlayerChange((val) => console.log("main player change", val));
    PlayersService.onSecondaryPlayerChange((val) => console.log("secondary player change", val));
    PlayersService.onSecondaryPlayerPossibleClassesChange((val) =>
      console.log("secondary player classes change", val)
    );
  }

  render() {
    return (
      <>
        <Selector />
        <Selector />
      </>
    );
  }
}

if (testing) ReactDOM.render(<Test />, document.getElementById("root"));
else ReactDOM.render(<GameFlowInterface />, document.getElementById("root"));
