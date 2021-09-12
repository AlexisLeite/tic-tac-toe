import { ComputerProfiler } from "components/common/profilers";
import { Player } from "./playersService";
import { api, round } from "common";
import { GameFlowService } from "services";

class tttNode {
  constructor(props) {
    Object.assign(this, props);
  }
}

class tttTree {
  constructor(tree) {
    // tree.moves = Object.values(tree.moves);
    Object.assign(this, { opponentTurn: false }, tree);

    for (let move in this.moves) {
      this.moves[move].opponentTurn = !this.opponentTurn;

      // Check node type
      this.moves[move] =
        "moves" in this.moves[move] ? new tttTree(this.moves[move]) : new tttNode(this.moves[move]);

      if ("statistics" in this.moves[move]) {
        this.moves[move].rate = round(
          this.moves[move].statistics.winnerMoves / this.moves[move].statistics.loserMoves,
          2
        );
      }

      if ("status" in this.moves[move]) {
        if (!(`${this.moves[move].status}Moves` in this))
          this[`${this.moves[move].status}Moves`] = {};

        this[`${this.moves[move].status}Moves`][move] = { ...this.moves[move] };
        delete this.moves[move];
      }

      if (Object.keys(this.moves).length === 0) delete this.moves;
    }
  }

  bestMove() {}
}

class RotationMap {
  constructor(rotation = 0) {
    if (rotation === -90) rotation = 270;
    this.rotation = rotation;

    this.createMap();
  }

  createMap() {
    this.map = {};
    for (let index = 0; index < 9; index++) {
      let y = Math.floor(index / 3),
        x = index % 3;
      let nX, nY;

      switch (this.rotation) {
        default:
        case 0:
          nY = y;
          nX = x;
          break;
        case 90:
          nY = 2 - x;
          nX = y;
          break;
        case 180:
          nY = 2 - y;
          nX = 2 - x;
          break;
        case 270:
          nX = 2 - y;
          nY = x;
          break;
      }

      this.map[index] = nY * 3 + nX;
    }
  }

  convert(index) {
    return this.map[index];
  }

  reverse(index) {
    for (let i in this.map) {
      if (this.map[i] === parseInt(index)) {
        return parseInt(i);
      }
    }
  }
}

export class ComputerPlayer extends Player {
  static publicName = "Computer player";
  kind = "Computer";

  getRandom(array) {
    let i = Math.floor(Math.random() * array.length);
    return array[i];
  }

  getTurn() {
    let currentPath = GameFlowService.history.gamePath;
    if (currentPath.length <= 1) {
      let rotationAngle = 0;
      if (currentPath.length > 0) {
        let initialMark = parseInt(currentPath);
        if ([6, 7, 8].includes(initialMark)) {
          rotationAngle = 180;
        }
        if (initialMark === 3) rotationAngle = 270;
        if (initialMark === 5) rotationAngle = 90;
      }
      this.map = new RotationMap(rotationAngle);
    }
    let ownPath = currentPath.replaceAll(/(\d)/g, (match, d) => {
      return this.map.convert(d);
    });
    if (ownPath.length === 17) {
      return;
    }

    console.log(api(`/tttMap/${ownPath}`));
    fetch(api(`/tttMap/${ownPath}`))
      .then((res) => res.json())
      .then((data) => {
        let tree = new tttTree(data);
        let move = null;
        if ("winnerMoves" in tree) {
          let winnerMoves = Object.keys(tree.winnerMoves);
          move = this.getRandom(winnerMoves);
        } else if ("moves" in tree) {
          // Set top values
          let topRate = { move: null, value: 0 };
          for (let i in tree.moves) {
            let move = tree.moves[i];
            move.statistics.rate = move.statistics.winnerMoves / move.statistics.loserMoves;
            if (move.statistics.rate > topRate.value)
              topRate = { move: i, value: move.statistics.rate };
          }
          if (topRate.move === null) move = this.getRandom(Object.keys(tree.moves));
          else move = topRate.move;
        } else if ("drawMoves" in tree) {
          move = this.getRandom(Object.keys(tree.drawMoves));
        }
        if (!("moves" in tree)) tree.moves = [];
        if (!("loserMoves" in tree)) tree.loserMoves = [];
        if (!("drawMoves" in tree)) tree.drawMoves = [];
        if (!("winnerMoves" in tree)) tree.winnerMoves = [];

        let percent = 100;
        if (this.profile.name === "Easy") percent = 50;
        if (this.profile.name === "Medium") percent = 90;
        let random = Math.random() * 100;
        if (move === null || random > percent) {
          move = this.getRandom([
            ...Object.keys(tree.moves),
            ...Object.keys(tree.drawMoves),
            ...Object.keys(tree.loserMoves),
            ...Object.keys(tree.winnerMoves),
          ]);
        }
        if (move !== null) {
          console.log(tree);
          GameFlowService.move(this.hash, this.map.reverse(move));
        }
      });
  }

  static get profiler() {
    return ComputerProfiler;
  }
}
