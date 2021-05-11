import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { Modal } from "components/common";
import { GameFlowService, PlayersService } from "services";
import { MultiStage, ucFirst, translate } from "common";

function PlayerStreak(props) {
  let i = props.slot === "main" ? 0 : 1;
  const profile = PlayersService.player(props.slot).profile;
  return (
    <div className="player-streak">
      <img src={profile.avatar} alt={`${ucFirst(props.slot)} ${translate("player's avatar")}`} />
      <div className="player-name">{profile.name}</div>
      <div className="player-streak-number">{GameFlowService.history.streak.wins[i]}</div>
    </div>
  );
}

class Results extends Component {
  static defaultProps = {
    onClose: () => {},
  };

  render() {
    const details = this.props.details;
    const Message = () =>
      MultiStage({
        stages: [
          [details.reason === "Draw", () => <h1>{translate("It's a draw")}</h1>],
          [
            details.reason === "Winner" || details.reason === "Abdicate",
            function () {
              const winner = details.winner;
              const loser = winner.opponent;

              const title =
                winner.value.kind === "Human"
                  ? `${winner.profile.name}, ${translate("you win")}`
                  : loser.kind === "Human"
                  ? `${winner.profile.name}, ${translate("you lost")}`
                  : `${winner.profile.name} ${translate("wins")}`;

              return (
                <>
                  <h1>{title}</h1>
                  {details.description && <h5>{details.description}</h5>}
                </>
              );
            },
          ],
          [
            true,
            () => {
              console.log(details);
              throw Error("The game has ended but the details are confusing");
            },
          ],
        ],
      });

    return (
      <Modal className={`results menu`} canClose={false}>
        <Message />
        <div className="streak">
          <PlayerStreak slot="main" />
          <PlayerStreak slot="secondary" />
        </div>
        <div className="options">
          <button
            onClick={() => {
              this.props.onClose();
              GameFlowService.startGame();
            }}
          >
            {translate("Play again")}
          </button>
          <button onClick={this.props.onClose}>{translate("Change players")}</button>
        </div>
      </Modal>
    );
  }
}

Results.propTypes = {
  details: PropTypes.object,
  onClose: PropTypes.func,
};

export default Results;
