import Modal from "components/layout/common/modal/modal";
import React from "react";
import PlayerProfiler from "../players/playerProfiler";
import { AutoReflectChangesComponent, translate } from "resources/common";

const emptyPlayer = {
  kind: "None",
  profile: {},
};

export class Menu extends AutoReflectChangesComponent {
  static defaultProps = {
    againstComputer: () => {},
    againstFriend: () => {},
    online: () => {},
    players: [{ ...emptyPlayer }, { ...emptyPlayer }],
  };

  constructor(props) {
    super(props);

    this.state = {
      players: props.players,
    };
  }

  stateDidUpdate(key, newValue) {
  }

  startGame = () => {
    if (
      !this.state.players[0].profile.name ||
      !this.state.players[1].profile.name
    ) {
      this.updateState({
        error: translate("You must choose both players"),
      });
    } else {
      this.updateState({
        error: false,
      });
      this.props.onStartGame([
        { ...this.state.players[0] },
        { ...this.state.players[1] },
      ]);
    }
  };

  render() {
    return (
      <Modal id="GameMenu" canClose={false}>
        <form onSubmit={e=> {
          e.preventDefault();
          this.startGame();
        }}>
        <button
          type="submit"
          className="menu-button main"
          id="Gooooo"
        >
          {translate("Play")}
        </button>
        {this.state.error && <div className="error">{this.state.error}</div>}
        <PlayerProfiler
          profile={this.state.players[0].profile}
          onChange={(playerA) => {
            this.updateState({ players: [playerA, this.state.players[1]] });
          }}
          title={translate("Player 1")}
          kinds={["Human", "Computer"]}
        />
        <PlayerProfiler
          profile={this.state.players[1].profile}
          onChange={(playerB) => {
            this.updateState({ players: [this.state.players[0], playerB] });
          }}
          title={translate("Player 2")}
          kinds={
            this.state.players[0].kind === "Computer"
              ? ["Human", "Computer"]
              : undefined
          }
        />
        </form>
      </Modal>
    );
  }
}

export default Menu;
