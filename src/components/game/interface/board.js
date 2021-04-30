import React, { Component } from "react";
import { asDebugable } from "resources/common";

export class Board extends Component {
  static defaultProps = {
    highlight: [],
    onClick: () => {},
    squares: [],
  };

  constructor(props) {
    super(props);

    asDebugable(this);
    this.debugLevel = 0;
  }

  render() {
    const squares = [];
    for (let i = 0; i < 3; i++) {
      let rowSquares = [];
      for (let j = 0; j < 3; j++) {
        let key = i * 3 + j;
        let button = (
          <button
            onClick={() => {
              this.props.onClick(key);
            }}
            className={`board-square ${this.props.squares[key].winner ? "winner" : ""} ${this.props.highlight.indexOf(key) !== -1 ? "highlighted" : ""}`}
            key={key}
          >
            {this.props.squares[key].mark}
          </button>
        );
        rowSquares.push(button);
      }

      let row = (
        <div className="board-row" key={i}>
          {rowSquares}
        </div>
      );
      squares.push(row);
    }

    return <div id="Board">{squares}</div>;
  }
}

export default Board;
