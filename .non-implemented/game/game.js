import React from "react";
import Board from "./interface/board";
import { asDebugable, hashes } from "../../src/resources/common";
import { AutoReflectChangesComponent } from "resources/common";

function PlayerHandler(objThis) {
  this.getFreeSquares = () => {
    return objThis.state.squares.filter((square) => {
      return square.mark === "";
    });
  };
  this.onClick = (callback) => {
    objThis.suscribeClickListener(callback);
  };
  this.play = (square, hash) => {
    // If the game is not running or if the selected square is marked, it wont
    // allow the move
    // Plus, the game will only allow the current's turn owner to play
    if (
      objThis.state.squares[square].mark !== "" ||
      !objThis.state.playing ||
      hash !== objThis.state.hashes[objThis.state.turn]
    ) {
      return;
    }

    // Set the board and change the turn
    let squares = objThis.state.squares.map((sq, i) => {
      return i === square
        ? {
            mark: objThis.players[objThis.state.turn].icon,
            winner: false,
          }
        : sq;
    });

    // Check if has anyone won

    let turn = Number(!Boolean(objThis.state.turn));

    if (!objThis.checkGame(squares)) {
      if (
        squares.filter((el) => {
          return el.mark === "";
        }).length === 0
      )
        objThis.shoutDraw();
      else objThis.shoutTurnChanged(turn);
    }

    objThis.updateState({
      squares,
      turn,
    });
  };
}

export class Game extends AutoReflectChangesComponent {
  static defaultProps = {
    handler: (gameHandler) => {},
    highlight: [],
    onGameStarted: () => {},
    onTurnChanged: () => {},
    onWinner: (winner) => {},
  };

  constructor(props) {
    super(props);

    asDebugable(this);
    this.debugLevel = 1;

    this.initialState = {
      squares: Array(9).fill({
        mark: "",
        winner: false,
      }),
      hashes: hashes(2),
    };

    this.state = { ...this.initialState, turn: 0 };

    this.players = [
      { icon: "X", setHandler: () => {} },
      { icon: "O", setHandler: () => {} },
    ];

    //this.debugReflect = true;
  }

  checkGame(squares) {
    let lines = [
      [0, 1, 2],
      [0, 4, 8],
      [0, 3, 6],
      [3, 4, 5],
      [6, 4, 2],
      [6, 7, 8],
      [1, 4, 7],
      [2, 5, 8],
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (
        squares[a].mark === squares[b].mark &&
        squares[c].mark === squares[b].mark &&
        squares[a].mark !== ""
      ) {
        this.updateState({
          playing: false,
          winner: this.state.turn,
          squares: squares.map((square, index) => {
            return line.indexOf(index) !== -1
              ? { mark: squares[index].mark, winner: true }
              : square;
          }),
        });

        this.shoutWinner(this.state.turn);

        return true;
      }
    }

    return false;
  }

  componentDidMount() {
    const gameHandler = {
      reset: () => {
        this.updateState({ ...this.initialState });
      },
      start: (players = null) => {
        this.updateState({ ...this.initialState, playing: true });

        if (players !== null) {
          this.players = players;

          if (!("hash" in this.players[0])) {
            this.players[0].setHandler(
              new PlayerHandler(this),
              this.state.hashes[0]
            );
          }

          if (!("hash" in this.players[1])) {
            this.players[1].setHandler(
              new PlayerHandler(this),
              this.state.hashes[1]
            );
          }
        }

        this.shoutTurnChanged(this.state.turn);
      },
    };

    this.props.handler(gameHandler);
  }

  handleClick = (square) => {
    this.players[this.state.turn].handleClick(square);
  };

  stateDidUpdate(key, value) {
    if (key === "playing") if (this.state.playing) this.props.onGameStarted();
  }

  shoutDraw() {
    this.props.onDraw();
  }

  shoutTurnChanged = (turn) => {
    this.props.onTurnChanged(turn);
    this.players[turn].getTurn();
  };

  shoutWinner = (winner) => {
    this.props.onWinner(winner);
  };

  render() {
    return (
      <Board
        highlight={this.props.highlight}
        onClick={this.handleClick}
        squares={this.state.squares}
      />
    );
  }
}

export default Game;
