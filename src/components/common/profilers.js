import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import { PlayersService } from "services";
import { exists, translate } from "common";
import { Selector } from "../common";

class PlayerProfiler extends PureComponent {
  static defaultProps = {
    onReady: () => {},
  };

  constructor(props) {
    super(props);

    this.slot = this.props.slot;
    this.player = PlayersService.player(this.slot);

    this.playerChangeSuscription = this.player.on("change", (player) => {
      this.setState({
        player,
      });
    });

    // If the profiler belongs to the secondary slot, it must listen to possible classes changes
    // in order to prevent the secondary player from being of an incorrect type
    if (this.slot.toLowerCase() === "secondary")
      this.possibleClassesChangeSuscription = this.player.on(
        "PossibleClassesChange",
        (possibleClasses) => {
          this.setState({ selectorOptions: possibleClasses });
        }
      );

    this.state = {
      selectorOptions: this.player.possibleClasses,
      profiler: exists(this, "player.value.constructor.profiler"),
    };
  }

  componentWillUnmount() {
    this.player.off("change", this.playerChangeSuscription);
    if (this.possibleClassesChangeSuscription)
      this.player.off("PossibleClassesChange", this.possibleClassesChangeSuscription);
  }

  render() {
    const Profiler = this.state.profiler;

    return this.state.selectorOptions.length ? (
      <div className="profiler">
        <div className="profiler-body">
          <>
            {!this.player.value && (
              <>
                <h1>{translate(`Choose ${this.slot} player`)}</h1>
                <Selector
                  options={this.state.selectorOptions}
                  map={(value) => translate(value.publicName)}
                  onChange={(i, chosenClass) => {
                    this.player.set = null;
                    if (
                      !this.player.value ||
                      this.player.value.constructor.name !== chosenClass.name
                    ) {
                      this.setState({
                        profiler: chosenClass.profiler,
                        profilerId: i,
                      });
                    }
                  }}
                  value={this.state.profilerId}
                />
              </>
            )}
            {Profiler && <Profiler slot={this.slot} />}
          </>
        </div>
      </div>
    ) : (
      ""
    );
  }
}

PlayerProfiler.propTypes = {
  slot: PropTypes.oneOf(PlayersService.availableSlots).isRequired,
  onReady: PropTypes.func,
};

export default PlayerProfiler;
