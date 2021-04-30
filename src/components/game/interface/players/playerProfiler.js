import React from "react";
import PlayersService from "resources/playersService";
import HumanProfiler from "./humanProfiler";
import Selector from "./selector";
import { AutoReflectChangesComponent } from "resources/common";

class PlayerProfiler extends AutoReflectChangesComponent {
  static defaultProps = {
    onChange: () => {},
    kinds: ["Human", "Computer", "Online"],
    profile: {},
  };

  constructor(props) {
    super(props);

    let indexInKindsArray = this.props.kinds.indexOf(this.props.profile.kind);

    this.state = {
      avatarImages: [],
      loaded: false,
      kinds: this.props.kinds,
      profile: this.props.profile,
      currentProfiler: indexInKindsArray !== -1 ? indexInKindsArray : 0,
    };

    //this.debugReflect = true;
  }

  componentDidMount() {
    PlayersService.getAvatarImages().then((avatars) => {
      this.updateState({
        avatarImages: avatars,
        loaded: true,
      });
    });
  }

  stateDidUpdate(key, newValue) {
    switch (key) {
      case "profile":
      case "currentProfiler":
        this.props.onChange({
          kind: this.state.kinds[this.state.currentProfiler],
          profile: this.state.profile,
        });
        break;

      default:
        console.log("Unexpected key update in playerProfiler", key);
    }
  }

  propertiesDidUpdate(prevProps) {
    if (
      this.props.kinds.length !== prevProps.kinds.length ||
      !this.props.kinds.every(
        (value, index) => value === prevProps.kinds[index]
      )
    ) {
      let currentProfiler =
        this.props.kinds.indexOf("Online") === -1 &&
        this.state.currentProfiler === 2
          ? 0
          : this.state.currentProfiler;

      this.updateState({ kinds: this.props.kinds, currentProfiler });
    }
  }

  render() {
    let Profiler;
    switch (this.state.currentProfiler) {
      case 0:
      default:
        Profiler = (
          <HumanProfiler
            onChange={(profile) => {
              this.updateState({ profile });
            }}
            images={this.state.avatarImages}
            profile={this.state.profile}
          />
        );
        break;
      case 1:
        // Computer profile
        Profiler = "Against Computer";
        break;

      case 2:
        // Online profile
        Profiler = "Online Oponent";
        break;
    }

    return (
      this.state.loaded && (
        <div className="profiler">
          <h3>{this.props.title}</h3>
          <Selector
            options={this.state.kinds}
            onChange={(val) => {
              this.updateState({ currentProfiler: val });
            }}
            value={this.state.currentProfiler}
          />
          {Profiler}
        </div>
      )
    );
  }
}

export default PlayerProfiler;
