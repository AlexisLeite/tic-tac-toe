import { HumanPlayer, PlayersSlots, PlayersService, ServerCommunications } from "services";
import React from "react";
import { translate } from "common";
import { PropTypes } from "prop-types";
import { Loader } from "components/common";
import urlPropType from "url-prop-type";

const apis = {
  avatars: "http://localhost/avatars",
  login: "http://localhost/login",
};

export class LoginForm extends React.PureComponent {
  usernameRef = React.createRef();
  state = {
    name: "",
    pass: "",
  };
  slot = this.props.slot;

  componentDidMount() {
    this.usernameRef.current.focus();
  }

  componentDidUpdate(prevProps, prevState) {
    const { name, pass } = this.state;
    if (prevState.name !== name || prevState.pass !== pass) {
      if (name.length >= 4 && pass.length >= 4) this.setState({ ready: true, error: null });
      else this.setState({ ready: false, error: null });
    }
  }

  login() {
    let { name, pass } = this.state;
    this.setState({ loading: true });
    UsersService.login({ name, pass }, this.props.slot)
      .then((res) => {
        PlayersService.player(this.slot).value = new HumanPlayer(res);
      })
      .catch((err) => {
        if (err.error !== "WRONG_CREDENTIALS") throw err;

        this.setState({
          error: translate("Incorrect username or password"),
          loading: false,
        });
      });
  }

  render() {
    if (this.state.loading) return <Loader />;
    return (
      <>
        <form
          id="LoginForm"
          onSubmit={(e) => {
            e.preventDefault();
            if (this.state.ready) {
              this.login();
            }
          }}
        >
          <div>
            <label>
              <input
                ref={this.usernameRef}
                type="text"
                placeholder={translate("Introduce username")}
                onChange={(e) => this.setState({ name: e.target.value })}
                value={this.state.name}
              ></input>
            </label>
            <label>
              <input
                type="password"
                placeholder={translate("Introduce password")}
                onChange={({ target: { value: pass } }) => this.setState({ pass })}
                value={this.state.pass}
              />
            </label>
          </div>
          <div>
            {this.state.ready && (
              <button className="main" type="submit">
                {translate("Login")}
              </button>
            )}
          </div>
        </form>
        {this.state.error && <div className="error">{this.state.error}</div>}
      </>
    );
  }
}

export class UserInfoCard extends React.PureComponent {
  render() {
    return (
      <div className={`${this.props.className ?? ""} user-info-card`}>
        <img alt="User avatar" src={this.props.profile.avatar} />
        <div>
          <h3 className="user-info-card-name">{this.props.profile.name}</h3>
          <h5 className="user-info-card-kind">{this.props.profile.kind}</h5>
        </div>
      </div>
    );
  }
}

UserInfoCard.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatar: urlPropType.isRequired,
  }),
};

LoginForm.propTypes = {
  slot: PropTypes.oneOf(["main", "secondary"]).isRequired,
};

var avatars = null;
export class UsersService {
  static loadAvatars() {
    return ServerCommunications.fetch(apis.avatars)
      .then((res) => {
        avatars = res;
      })
      .catch((err) => console.error("Error trying to fetch avatar images", err));
  }
  static getAvatars() {
    return avatars;
  }

  static getCurrentUser(slot) {
    if (!PlayersSlots.includes(slot))
      throw new Error("You must provide an slot on your login try.");
    return window.localStorage.getItem(`${slot}.credentials`);
  }

  static login(profile, slot) {
    if (!PlayersService.availableSlots.includes(slot))
      throw new Error("You must provide an slot on your login try.");

    if (!("pass" in profile)) profile.asGuest = true;
    return ServerCommunications.post(apis.login, profile).then((res) => {
      if (!("error" in res)) window.localStorage.setItem(`${slot}.credentials`, res);
    });
  }
}
