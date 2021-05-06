import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import GameFlowInterface from "components/game";
import { MultiStage } from "common";
//import memoizeOne from "memoize-one";

const testing = false;

class Test extends React.PureComponent {
  render() {
    return (
      <>
        <MultiStage
          multiple={true}
          stages={[
            [true, () => "Hola"],
            [true, () => "Mundo"],
          ]}
        />
      </>
    );
  }
}

if (testing) ReactDOM.render(<Test />, document.getElementById("root"));
else ReactDOM.render(<GameFlowInterface />, document.getElementById("root"));
