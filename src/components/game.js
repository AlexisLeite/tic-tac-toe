import { className, MultiStage, translate } from "common";
import React, { Component } from "react";
import { ComputerPlayer, HumanPlayer, PlayersService, ServicesLoader } from "services";
import { Board, GameFlowService } from "services/gameFlowService";
import { UserInfoCard } from "services/usersService";
import { Loader, Modal } from "./common";
import Menu from "./gameFlow/menu";
import Results from "./gameFlow/results";

/**
 *
 *
 * @class GameFlowInterface
 * @extends {Component}
 */
class GameFlowInterface extends Component {
  state = {
    showResults: false,
    gameInProgress: false,
    paused: false,
    ready: false,
    gameResults: {},
    turn: "main",
  };

  constructor(props) {
    super(props);

    this.ongsSuscription = GameFlowService.onGameStart((turn) => {
      this.setState({ gameInProgress: true, paused: false });
    });
    this.ongeSuscription = GameFlowService.onGameEnd((evt) => {
      setTimeout(
        () =>
          this.setState({
            gameInProgress: false,
            showResults: true,
            gameResults: evt,
          }),
        1500
      );
    });

    this.ontcSuscription = GameFlowService.onTurnChange((player) =>
      this.setState({ turn: player.slot })
    );

    PlayersService.player("main").value = new HumanPlayer({
      name: "Alexis",
      avatar: "http://localhost/images/avatar_09.png",
    });
    PlayersService.player("secondary").value = new ComputerPlayer({
      name: "Hard",
      avatar: "http://localhost/images/avatar_03.png",
    });
  }

  /**
   *
   *
   * @memberof GameFlowInterface
   */
  componentDidMount() {
    ServicesLoader.onReady(() => this.setState({ ready: true }));
  }

  componentWillUnmount() {
    this.ongsSuscription.cancel();
    this.ongeSuscription.cancel();
    this.ontcSuscription.cancel();
  }

  startGame = () => {
    GameFlowService.startGame();
  };

  render() {
    return (
      <MultiStage
        multiple={true}
        stages={[
          [
            !this.state.ready,
            () => (
              <Modal canClose={false} centeredFlex={true}>
                <Loader />
              </Modal>
            ),
          ],
          [
            this.state.showResults,
            () => (
              <Results
                details={this.state.gameResults}
                onClose={() => {
                  this.setState({ showResults: false });
                }}
              />
            ),
          ],
          [
            this.state.gameInProgress || this.state.paused || this.state.showResults,
            () => (
              <div className="playingInterface">
                <div className="current-players">
                  <UserInfoCard
                    {...className(this.state.turn === "main", "playing")}
                    profile={PlayersService.player("main").profile}
                  />
                  <UserInfoCard
                    {...className(this.state.turn === "secondary", "playing")}
                    profile={PlayersService.player("secondary").profile}
                  />
                </div>
                <Board />
                <div className="options-bar">
                  <button onClick={() => this.setState({ paused: true })}>
                    {translate("Menu")}
                  </button>
                </div>
                {this.state.paused && (
                  <Modal className="menu" canClose={false}>
                    <button onClick={() => this.setState({ paused: false })}>
                      {translate("Continue")}
                    </button>
                    <button
                      onClick={() => {
                        this.setState({ paused: false });
                        GameFlowService.abdicate(GameFlowService.currentPlayer.hash);
                      }}
                    >
                      {translate("Resign")}
                    </button>
                  </Modal>
                )}
              </div>
            ),
          ],
          [
            !this.state.gameInProgress && !this.state.paused && !this.state.showResults,
            () => <Menu play={this.startGame} />,
          ],
        ]}
      />
    );
  }
}

export default GameFlowInterface;
