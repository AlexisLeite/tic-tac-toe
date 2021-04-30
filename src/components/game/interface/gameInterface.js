import React from "react";
import Game from "../game";
import Loader from "components/layout/loader";
import Menu from "./menu/menu";
import { translate } from "./../../../resources/common";
import { AutoReflectChangesComponent } from 'resources/common';

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

  getTurn() {
    console.log(`${this.profile.name}: Oh, it's my turn already!`);
  }

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

    //this.debugReflect = true;
  }  

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

  render() {
    return (
      <>
        <Loader show={!this.state.loadFinished} />
        {this.state.showWinner && !this.state.playing && (
          <div>
            <h1 className="winner-announce">
              {translate(`Congratulations, ${this.state.winner.profile.name}.`)}
            </h1>
            {this.state.showPlayAgain && (
              <button
                onClick={() => {
                  this.gameHandler.start();
                }}
              >
                {translate("Play again")}
              </button>
            )}
          </div>
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
                console.log('Start game order given', players);
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
            onGameEnded={this.handleGameEnded}
            onGameStarted={this.handleGameStarted}
          />
        </main>
      </>
    );
  }
}

export default GameInterface;
