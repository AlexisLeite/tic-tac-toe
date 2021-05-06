import { PureComponent } from "react";
import { hashes, EasyEvents, ucFirst, exists, required, consoleAccess } from "common";
import { PlayersService } from "services";

class GameEndReason {
  constructor(reason = required("reason"), aditionalData) {
    Object.assign(this, { reason, ...aditionalData });
  }
}

class GamesHistory {
  currentGame = -1;
  games = [];

  endGame(reason) {
    this.games[this.currentGame].endReason = reason;
  }

  move(details) {
    if (this.currentGame === -1) console.warn("Tried to add move to history while no game active");
    else this.games[this.currentGame].moves.push(details);
  }

  newGame(data) {
    this.games.push({ ...data, moves: [] });
    this.currentGame = this.games.length - 1;
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
    return this._boardStatus;
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
    this.fireGameEnd(reason);
    this.playing = false;
    this.history.endGame(reason);
  }

  move(hash, square) {
    if (!this.playing) return;
    if (this.hashes.indexOf(hash) === this.turn) {
      if (this.boardStatus[square] !== null)
        console.log(
          "%cThe selected move can't be performed, the square is already checked",
          "color:green"
        );
      else {
        this._boardStatus[square] = this.turn;
        this.fireBoardUpdate(this.boardStatus);
        this.fireMove(new MoveEvent(square, this.turnOwner));
        this.history.move({
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
        this.history.newGame();
        this.shoutTurn();
      } else console.warn("Trying to start a game without both players ready");
    } else console.warn("Trying to start a game when a game has already started.");
  }
}

class Board extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      squares: Array(9).fill(null),
      winnerRow: [],
    };

    this.boardUpdateSuscription = GameFlowService.onBoardUpdate((squares) =>
      this.setState({
        squares: squares.map((el) => {
          return el === 0 ? "X" : el === 1 ? "O" : null;
        }),
      })
    );
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
    GameFlowService.offBoardUpdate(this.boardUpdateSuscription);
    GameFlowService.offGameEnd(this.gameEndSuscription);
    GameFlowService.offGameStart(this.gameStartSuscription);
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
            {this.state.squares[key]}
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
