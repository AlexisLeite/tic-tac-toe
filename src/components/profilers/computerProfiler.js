import { Selector } from "components/common/selectors";
import React, { Component } from "react";
import { api, exists, MultiStage, translate, ucFirst } from "common";
import { UserInfoCard, PlayersService } from "services";
import { ComputerPlayer } from "services/playersService";

class ComputerProfiler extends Component {
  options = [
    { difficulty: "easy", description: translate("Do you want to win? Try this") },
    { difficulty: "medium", description: translate("Not so bad, little challenge") },
    { difficulty: "hard", description: translate("Can you beat it?") },
  ];

  constructor(props) {
    super(props);

    this.player = PlayersService.player(this.props.slot);

    this.state = { player: this.player.value };

    this.pcSuscription = this.player.on("change", (player) => {
      this.setState({ player });
    });
  }

  componentWillUnmount() {
    exists(this, "pcSuscription.cancel", (cancel) => cancel());
  }

  render() {
    return (
      <div className="computer-profiler">
        <MultiStage
          stages={[
            [
              !this.state.player,
              <>
                <Selector
                  options={this.options}
                  map={(op) => (
                    <div>
                      <img
                        src={api(`../images/computer/${op.difficulty}.png`)}
                        alt="Computer player avatar"
                      />
                      <h3>{translate(ucFirst(op.difficulty))}</h3>
                      <p>{op.description}</p>
                    </div>
                  )}
                  onChange={(op, val) => this.setState({ selectedProfile: val })}
                />
                <button
                  onClick={() => {
                    this.player.value = new ComputerPlayer({
                      name: `${ucFirst(this.state.selectedProfile.difficulty)}`,
                      avatar: api(
                        `../images/computer/${this.state.selectedProfile.difficulty}.png`
                      ),
                    });
                  }}
                >
                  {translate("Confirm")}
                </button>
              </>,
            ],
            [
              true,
              () => (
                <>
                  <UserInfoCard
                    profile={{ ...this.player.value.profile, kind: this.player.kind }}
                  />
                  <button
                    onClick={() => {
                      this.player.value = null;
                    }}
                  >
                    {translate("Back")}
                  </button>
                </>
              ),
            ],
          ]}
        />
      </div>
    );
  }
}

export { ComputerProfiler };
