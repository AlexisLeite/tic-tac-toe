import React, { Component } from "react";
import { UserInfoCard, HumanPlayer, PlayersService, UsersService, LoginForm } from "services";
import { PropTypes } from "prop-types";
import { translate, exists } from "common";
import { Loader } from "components/common";
import GuestProfiler from "./guestProfiler";

const STAGE_WELCOME = 0,
  STAGE_PROFILE = 1,
  STAGE_GUEST = 2,
  STAGE_LOGIN = 3;

const BUTTON_ASGUEST = 0,
  BUTTON_ASLOGIN = 1,
  BUTTON_BACK = 2,
  BUTTON_CONFIRM = 3,
  BUTTON_LOGOUT = 5,
  BUTTON_REGISTER = 6;

const stageButtons = {
  [STAGE_WELCOME]: [BUTTON_ASGUEST, BUTTON_ASLOGIN],
  [STAGE_PROFILE]: [BUTTON_LOGOUT],
  [STAGE_LOGIN]: [BUTTON_BACK, BUTTON_REGISTER],
  [STAGE_GUEST]: [BUTTON_BACK, BUTTON_CONFIRM],
};

class HumanProfiler extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stage: 0,
      loadingLogin: false,
      selectedProfile: false,
      avatars: Object.values(UsersService.getAvatars()),
    };

    this.slot = this.props.slot;
    this.player = PlayersService.player(this.slot);

    if (this.player.value)
      Object.assign(this.state, {
        stage: STAGE_PROFILE,
      });

    this.changeSuscription = this.player.on("change", (player) => {
      if (player !== null) this.setState({ stage: STAGE_PROFILE });
    });
  }

  componentWillUnmount() {
    this.player.off("change", this.changeSuscription);
    exists(this, "tryLoginSuscription.cancel", (cancel) => cancel());
  }

  login = () => {
    let profile = this.state.selectedProfile;
    this.tryLoginSuscription = UsersService.login(profile, this.slot);
    this.tryLoginSuscription
      .then((res) => {
        console.log(res);
        if (!("error" in res)) {
          this.player.value = new HumanPlayer(res);
          this.setState({ loadingLogin: false });
        }
      })
      .catch((e) => console.error(e));
    this.setState({ loadingLogin: true });
  };

  logout = () => {
    this.player.value = null;
    this.setState({ stage: STAGE_WELCOME });
  };

  render() {
    let Stage;
    switch (this.state.stage) {
      default:
      case STAGE_WELCOME:
        Stage = (
          // Initial stage, select kind of player
          <>
            <h3>{translate("Login as:")}</h3>
          </>
        );
        break;
      case STAGE_PROFILE:
        Stage = (
          <UserInfoCard profile={{ ...this.player.value.profile, kind: this.player.value.kind }} />
        );
        break;
      case STAGE_GUEST:
        Stage = this.state.loadingLogin ? (
          <Loader />
        ) : (
          <GuestProfiler
            onChange={(selectedProfile) => this.setState({ selectedProfile })}
            slot={this.props.slot}
            avatars={this.state.avatars}
          />
        );
        break;
      case STAGE_LOGIN:
        Stage = <LoginForm slot={this.slot} onReady />;
    }

    return (
      <div className="human-profiler">
        <div
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              this.state.selectedProfile &&
              e.target.value === this.state.selectedProfile.name
            ) {
              this.login();
            }
          }}
          className={`stage-${this.state.stage}`}
        >
          <div className="stage-body">{Stage}</div>
          {stageButtons[this.state.stage].includes(BUTTON_ASGUEST) && (
            <button onClick={() => this.setState({ stage: STAGE_GUEST })}>
              {translate("Guest")}
            </button>
          )}
          {stageButtons[this.state.stage].includes(BUTTON_ASLOGIN) && (
            <button onClick={() => this.setState({ stage: STAGE_LOGIN })}>
              {translate("Login")}
            </button>
          )}
          {stageButtons[this.state.stage].includes(BUTTON_BACK) && (
            <button onClick={this.logout}>{translate("Back")}</button>
          )}
          {stageButtons[this.state.stage].includes(BUTTON_CONFIRM) && (
            <button
              className="main"
              onClick={this.login}
              type="submit"
              disabled={!this.state.selectedProfile}
            >
              {translate("Confirm")}
            </button>
          )}
          {stageButtons[this.state.stage].includes(BUTTON_LOGOUT) && (
            <button onClick={this.logout}>{translate("Logout")}</button>
          )}
          {stageButtons[this.state.stage].includes(BUTTON_REGISTER) && (
            <button disabled={true} onClick={() => console.log("register")}>
              {translate("Register")}
            </button>
          )}
        </div>
      </div>
    );
  }
}

HumanProfiler.propTypes = {
  slot: PropTypes.oneOf(["main", "secondary"]).isRequired,
};

export { HumanProfiler };
