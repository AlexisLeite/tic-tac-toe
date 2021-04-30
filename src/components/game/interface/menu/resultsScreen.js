import React from "react";
import { AutoReflectChangesComponent } from "resources/common";
import { translate } from "resources/common";
import PropTypes from "prop-types";
import { Modal } from "components/layout/common/modal/modal";

class ResultsScreen extends AutoReflectChangesComponent {
  render() {
    return (
      <Modal canClose={false} id="GameResults">
        <div className='image-container'><img alt="Winner avatar" src={this.props.winner.image} /></div>
        <h1 className="winner-announce">
          {translate(`Congratulations, ${this.props.winner.name}.`)}
        </h1>
        <button
          onClick={() => {
            this.props.playAgain();
          }}
        >
          {translate("Play again")}
        </button>
        <button
          onClick={() => {
            this.props.changePlayers();
          }}
        >
          {translate("Change players")}
        </button>
      </Modal>
    );
  }
}

ResultsScreen.propTypes = {
  winner: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  playAgain: PropTypes.func.isRequired,
  changePlayers: PropTypes.func.isRequired,
};

export default ResultsScreen;
