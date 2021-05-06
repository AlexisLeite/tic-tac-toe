import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { Modal } from "components/common";
import { GameFlowService } from "services";
import { MultiStage } from "common";

class Results extends Component {
  componentDidMount() {
    console.log(this.props.details);
  }

  render() {
    const details = this.props.details;
    const Message = MultiStage({
      stages: [
        [details.reason === "Draw", () => <h1>You draw</h1>],
        [
          details.reason === "Winner" || details.reason === "Abdicate",
          function () {
            const winner = details.winner;
            const loser = winner.opponent;

            const title =
              winner.value.kind === "Human"
                ? `${winner.profile.name}, you won`
                : loser.kind === "Human"
                ? `${winner.profile.name}, you lost`
                : `${winner.profile.name} wons`;

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
      <Modal>
        <Message />
      </Modal>
    );
  }
}

Results.propTypes = {
  details: PropTypes.object,
};

export default Results;
