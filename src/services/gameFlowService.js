import { Component } from "react";
import { hashes, EasyEvents, ucFirst, exists, required, consoleAccess } from "common";
import { PlayersService } from "services";

class GameEndReason {
  constructor(reason = required("reason"), aditionalData) {
    Object.assign(this, { reason, ...aditionalData });
  }
}

class GamesHistory {
  _currentGame = -1;
  maxGamesSaved = 5;
  gamePath = "";
  games = [];
  streak = new (function () {
    this.hashes = [null, null];
    this.push = (currentGame) => {
      if (currentGame.hashes[0] !== this.hashes[0] || currentGame.hashes[1] !== this.hashes[1]) {
        this.hashes = [currentGame.hashes[0], currentGame.hashes[1]];
        this.wins = [0, 0];
      }
      if (currentGame.endReason.winner) {
        this.wins[this.hashes.indexOf(currentGame.endReason.winner.hash)]++;
      } else if (currentGame.endReason.reason === "Draw") {
        this.wins[0]++;
        this.wins[1]++;
      }
    };
  })();

  endGame(reason) {
    this.currentGame.endReason = reason;
    this.streak.push(this.currentGame);
    this.gamePath = "";
  }

  get currentGame() {
    if (this.games.length) return this.games[this._currentGame];
    return null;
  }

  get lastGame() {
    if (this.games.length) return this.games[this.games.length - 1];
    return null;
  }

  move(details) {
    if (!this.currentGame) console.warn("Tried to add move to history while no game active");
    else {
      if (this.gamePath.length) this.gamePath += ".";
      this.gamePath += details.square;
      this.currentGame.moves.push(details);
    }
  }

  newGame(data) {
    this.games.push({ ...data, moves: [] });
    if (this.games.length > this.maxGamesSaved)
      this.games = this.games.slice(this.games.length - this.maxGamesSaved);
    this._currentGame = this.games.length - 1;
    return this.currentGame;
  }
}

class MoveEvent {
  constructor(square = required("square"), slot = required("slot")) {
    Object.assign(this, { square, slot });
  }
}

class GameFlowServiceClass {
  _boardStatus = Array(9).fill(null);
  get boardStatus() {
    return [...this._boardStatus];
  }

  // Players handling
  players = [null, null];
  get currentPlayer() {
    return this.players[this.turn];
  }
  get mainPlayer() {
    return this.players[0];
  }
  get secondaryPlayer() {
    return this.players[1];
  }
  get turnOwner() {
    return this.players[this.turn];
  }

  // Service state
  playing = false;
  turn = 0;
  hashes = [null, null];
  history = new GamesHistory();

  constructor() {
    EasyEvents.call(this);
    this.addEvents(["boardClick", "boardUpdate", "gameEnd", "gameStart", "move", "turnChange"]);
    this.clearBoard();
  }

  abdicate(hash) {
    let index = this.hashes.indexOf(hash);
    if (index !== -1) {
      this.endGame(
        new GameEndReason("Abdicate", {
          description: `${ucFirst(this.players[index].profile.name)} abdicated`,
          winner: PlayersService.player(this.slotName(index)).opponent,
        })
      );
    } else {
      console.warn("Trying to abdicate with incorrect hash");
    }
  }

  changeTurn() {
    this.turn = Number(!Boolean(this.turn));
  }

  checkGame() {
    for (let line of Board.lines) {
      const [a, b, c] = line;
      if (
        this.boardStatus[a] === this.boardStatus[b] &&
        this.boardStatus[c] === this.boardStatus[b] &&
        this.boardStatus[a] !== null
      ) {
        return line;
      }
    }

    return false;
  }

  clearBoard() {
    this._boardStatus = Array(9).fill(null);
    this.fireBoardUpdate(this._boardStatus);
  }

  endGame(reason) {
    this.history.endGame(reason);
    this.playing = false;
    this.fireGameEnd(reason);
  }

  getByHash(hash) {
    let index = this.hashes.indexOf(hash);
    return exists(this, `players.${index}`);
  }

  move(hash, square) {
    if (!this.playing) return;
    if (this.hashes.indexOf(hash) === this.turn) {
      if (this.boardStatus[square] !== null) {
        console.log(this.boardStatus, square, this.boardStatus[square]);
        console.log(
          "%cThe selected move can't be performed, the square is already checked",
          "color:green"
        );
      } else {
        this._boardStatus[square] = this.turn;
        this.fireBoardUpdate(this.boardStatus);
        this.fireMove(new MoveEvent(square, this.turnOwner));
        this.history.move({
          square,
          turn: this.turn,
          name: this.currentPlayer.value.profile.name,
          boardStatus: [...this.boardStatus],
        });

        let winnerRow = this.checkGame();
        if (Array.isArray(winnerRow)) {
          this.endGame(new GameEndReason("Winner", { winner: this.turnOwner, winnerRow }));
        } else if (this.boardStatus.filter((el) => el === null).length === 0) {
          this.endGame(new GameEndReason("Draw"));
        } else {
          this.changeTurn();
          this.shoutTurn();
        }
      }
    } else {
      console.warn("Trying to make move with incorrect hash");
    }
  }

  registerBoard(board) {
    exists(this, "board.offClick", (offClick) => offClick(this.boardSuscription));
    this.board = board;
    this.boardSuscription = this.board.onClick((square) => {
      this.fireBoardClick(square);
      this.currentPlayer.value.boardClick(square);
    });
  }

  shoutTurn() {
    this.currentPlayer.value.getTurn();
    this.fireTurnChange(this.turnOwner);
  }

  slotName(index) {
    return index === 0 ? "main" : index === 1 ? "secondary" : "WRONG SLOT";
  }

  startGame() {
    if (!this.playing) {
      this.players = [PlayersService.player("main"), PlayersService.player("secondary")];

      if (this.mainPlayer.value && this.secondaryPlayer.value) {
        // Check if players are the same that last game
        if (
          this.mainPlayer.value.hash === this.hashes[0] &&
          this.secondaryPlayer.value.hash === this.hashes[1]
        ) {
          this.changeTurn();
        } else {
          // If one of the players is new, there is neccesary to update hashes,
          // the turn has no relation with the previous turn
          let midHashes = hashes(2);

          // Set players hashes
          if (this.mainPlayer.value.hash !== this.hashes[0]) {
            this.hashes[0] = midHashes[0];
            this.mainPlayer.value.updateHash(midHashes[0]);
            exists(this, "mainPlayerSuscription", (suscription) =>
              this.mainPlayer.off("change", suscription)
            );
            this.mainPlayerSuscription = this.mainPlayer.on("change", (player) => {
              if (this.playing && exists(player, "value.hash") !== this.hashes[0])
                this.abdicate(midHashes[0]);
            });
          }
          if (this.secondaryPlayer.value.hash !== this.hashes[1]) {
            this.hashes[1] = midHashes[1];
            this.secondaryPlayer.value.updateHash(midHashes[1]);
            exists(this, "secondaryPlayerSuscription", (suscription) =>
              this.secondaryPlayer.off("change", suscription)
            );
            this.secondaryPlayerSuscription = this.secondaryPlayer.on("change", (player) => {
              if (this.playing && exists(player, "value.hash") !== this.hashes[0])
                this.abdicate(midHashes[1]);
            });
          }

          // Set the current hashes
          this.hashes = [this.mainPlayer.value.hash, this.secondaryPlayer.value.hash];

          this.turn = Math.round(Math.random(1));
        }

        // Start game
        this.playing = true;
        this.clearBoard();
        this.fireGameStart(this.turn);
        this.history.newGame({
          hashes: [...this.hashes],
        });
        this.shoutTurn();
      } else console.warn("Trying to start a game without both players ready");
    } else console.warn("Trying to start a game when a game has already started.");
  }
}

class Board extends Component {
  static defaultProps = {
    mainMark: "X",
    secondaryMark: "O",
  };

  static lines = [
    [0, 1, 2],
    [0, 4, 8],
    [0, 3, 6],
    [3, 4, 5],
    [6, 4, 2],
    [6, 7, 8],
    [1, 4, 7],
    [2, 5, 8],
  ];

  constructor(props) {
    super(props);

    this.state = {
      squares: GameFlowService._boardStatus,
      winnerRow: [],
    };

    this.boardUpdateSuscription = GameFlowService.onBoardUpdate((squares) => {
      this.setState({
        squares,
      });
    });
    this.gameEndSuscription = GameFlowService.onGameEnd((endReason) => {
      if (endReason.reason === "Winner") {
        this.setState({
          winnerRow: endReason.winnerRow,
        });
      }
    });
    this.gameStartSuscription = GameFlowService.onGameStart((ev) => {
      console.log("gamestart", ev);
      this.setState({
        winnerRow: [],
      });
    });

    EasyEvents.call(this);
    this.addEvent("click");

    GameFlowService.registerBoard(this);
  }

  componentWillUnmount() {
    exists(this, "boardUpdateSuscription.cancel", (cancel) => cancel());
    exists(this, "gameEndSuscription.cancel", (cancel) => cancel());
    exists(this, "gameStartSuscription.cancel", (cancel) => cancel());
  }

  render() {
    const squares = [];
    for (let i = 0; i < 3; i++) {
      let rowSquares = [];
      for (let j = 0; j < 3; j++) {
        let key = i * 3 + j;
        let button = (
          <button
            onClick={() => this.fireClick(key)}
            className={`board-square ${this.state.winnerRow.includes(key) ? "winner" : ""}`}
            key={key}
          >
            {this.state.squares[key] === 0
              ? this.props.mainMark
              : this.state.squares[key] === 1
              ? this.props.secondaryMark
              : ""}
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

const GameFlowService = new GameFlowServiceClass();
consoleAccess("gfs", GameFlowService);

export { GameFlowService, Board };
