import { consoleAccess, MultiStage } from "common";
import React, { Component } from "react";
import { HumanPlayer, PlayersService, ServicesLoader, ServerCommunications } from "services";
import { Board, GameFlowService } from "services/gameFlowService";
import { Loader, Modal } from "./common";
import Menu from "./gameFlow/menu";
import Results from "./gameFlow/results";

class GameFlowInterface extends Component {
  state = { gameInProgress: false, paused: false, ready: false, gameResults: {} };

  constructor(props) {
    super(props);

    GameFlowService.onGameStart((turn) => {
      this.setState({ gameInProgress: true, paused: false });
    });
    GameFlowService.onGameEnd((evt) => {
      this.setState({
        gameInProgress: false,
        showResults: true,
        gameResults: evt,
      });
    });

    PlayersService.player("main").value = new HumanPlayer({
      name: "Alexis",
      avatar: "http://localhost/images/avatar_09.png",
    });
    PlayersService.player("secondary").value = new HumanPlayer({
      name: "Pepe",
      avatar: "http://localhost/images/avatar_03.png",
    });
  }

  componentDidMount() {
    ServicesLoader.onReady(() => this.setState({ ready: true }));
    consoleAccess("q", {
      HumanPlayer,
      PlayersService,
      ServerCommunications,
      GameFlowService,
    });
  }

  startGame = () => {
    GameFlowService.startGame();
  };

  render() {
    return (
      <MultiStage
        stages={[
          [
            !this.state.ready,
            <Modal centeredFlex={true}>
              <Loader />
            </Modal>,
          ],
          [this.state.showResults, <Results details={this.state.gameResults} />],
          [this.state.gameInProgress && !this.state.paused, <Board />],
          [true, <Menu play={this.startGame} />],
        ]}
      />
    );
  }
}

export default GameFlowInterface;
