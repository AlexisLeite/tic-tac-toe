import React, { Component } from "react";
import { PlayersService } from "services";
import { translate } from "common";
import PlayerProfiler from "../common/profilers";
import { PropTypes } from "prop-types";

export default class Menu extends Component {
  constructor(props) {
    super(props);

    this.mainPlayer = PlayersService.player("main");
    this.secondaryPlayer = PlayersService.player("secondary");

    this.mainSuscription = this.mainPlayer.on("change", (mainPlayer) =>
      this.setState({ mainPlayer })
    );
    this.secondarySuscription = this.secondaryPlayer.on("change", (secondaryPlayer) =>
      this.setState({ secondaryPlayer })
    );

    this.state = {
      mainPlayer: this.mainPlayer,
      secondaryPlayer: this.secondaryPlayer,
    };
  }

  componentWillUnmount() {
    this.mainPlayer.off("change", this.mainSuscription);
    this.secondaryPlayer.off("change", this.secondarySuscription);
  }

  render() {
    return (
      <nav id="gameMenu">
        <button
          id="PlayButton"
          className="main"
          disabled={!(this.state.mainPlayer && this.state.secondaryPlayer)}
          onClick={this.props.play}
        >
          {translate("Play")}
        </button>

        <PlayerProfiler slot="main" />
        <PlayerProfiler slot="secondary" />
      </nav>
    );
  }
}

Menu.propTypes = {
  play: PropTypes.func.isRequired,
};
