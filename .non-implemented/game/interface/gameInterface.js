import React from "react";
import Game from "../game";
import Loader from "components/common/loader";
import Menu from "./menu/menu";
import { translate } from "../../../src/resources/common";
import { AutoReflectChangesComponent } from "resources/common";
import ResultsScreen from "./menu/resultsScreen";
import { UsersService } from "resources/usersService";

class Player {
  onSet() {}

  setHandler(playerHandler, hash) {
    this.playerHandler = playerHandler;
    this.hash = hash;

    this.onSet();
  }
}

class HumanPlayer extends Player {
  constructor(props) {
    super();

    Object.assign(
      this,
      {
        icon: "X",
      },
      props
    );
  }

  getTurn() {}

  onSet() {}

  handleClick = (square) => {
    this.playerHandler.play(square, this.hash);
  };
}

export class GameInterface extends AutoReflectChangesComponent {
  constructor(props) {
    super(props);

    Object.assign(this, {
      gameHandler: () => {},
    });

    this.state = {
      loadFinished: false,
      players: undefined,
      playing: false,
    };

    this.gameHandler = {
      start: () => {},
    };
  }

  componentDidMount() {
    UsersService.leaderboard().then((res) => {
      this.updateState({
        leaderboard: res,
      });
    });
  }

  handleDraw = () => {
    this.updateState({
      playing: false,
    });
  };

  handleGameStarted = () => {
    this.updateState({
      playing: true,
      showWinner: false,
      showPlayAgain: false,
    });
  };

  handleWinner = (winner) => {
    this.updateState({
      showWinner: true,
      playing: false,
      winner: this.state.players[winner],
    });

    setTimeout(() => {
      this.updateState({ showPlayAgain: true });
    }, 1000);
  };

  handleInterface = (instruction, ...parameters) => {
    instruction = instruction.match(/^([\w\d]+)-([\w\d]+)$/);
    if (instruction) {
      let actions = {
        game: this.gameHandler,
      };

      let [, handler, action] = instruction;

      if (handler in actions && action in actions[handler]) {
        actions[handler][action](...parameters);
      }
    }
  };

  initInterface() {
    this.updateState({
      loadFinished: true,
    });
  }

  setHandler = (handler) => {
    this.gameHandler = handler;

    this.initInterface();
  };

  stateDidUpdate(key, prop, prev) {}

  render() {
    return (
      <>
        <Loader show={!this.state.loadFinished} />
        {this.state.showWinner && !this.state.playing && (
          <ResultsScreen
            winner={this.state.winner.profile}
            playAgain={() => {
              this.gameHandler.start();
            }}
            changePlayers={() => {
              this.updateState({
                showWinner: false,
              });
            }}
          />
        )}
        {this.state.loadFinished &&
          !this.state.playing &&
          !this.state.showWinner && (
            <Menu
              onStartGame={(players) => {
                for (let i in players) {
                  switch (players[i].kind) {
                    case "Human":
                      players[i] = new HumanPlayer(players[i]);
                      break;
                    default:
                      throw translate("Non supported kind of player");
                  }
                }

                players[1].icon = "O";
                this.updateState({ players });
                this.gameHandler.start(players);
              }}
              players={this.state.players}
            />
          )}
        <main>
          <Game
            // Flow control
            handler={this.setHandler}
            onWinner={this.handleWinner}
            onGameStarted={this.handleGameStarted}
            onDraw={this.handleDraw}
          />
        </main>
      </>
    );
  }
}

export default GameInterface;
