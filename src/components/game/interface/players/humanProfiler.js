import React, { Component } from "react";
import ImageSelector from "./imageSelector";
import { translate } from "./../../../../resources/common";
import Login from "./login";
import UserProfile from "./userProfile";

const initialProfile = {
  image: "",
  name: translate(""),
  relation: "None",
};

class HumanProfiler extends Component {
  static defaultProps = {
    profile: { relation: "none " },
  };

  constructor(props) {
    super(props);

    this.state = {
      stage: 0,
      guestImage: 0,
      profile: {...initialProfile},
    };

    switch (this.props.profile.relation) {
      case "Logged":
        this.state.stage = 3;
        this.state.profile = this.props.profile;
        break;

      case "Guest":
        this.state.stage = 1;
        this.state.profile = this.props.profile;
        this.state.guestImage = this.props.profile.guestImage;
        break;
      default:
        break;
    }

    this.guestNameRef = React.createRef();

  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.stage !== 1 && this.state.stage === 1)
      this.guestNameRef.current.focus();
    }

  logout() {
    let newProfile = {...initialProfile};

    this.setState({
      profile: newProfile,
      stage: 0,
    });


    this.props.onChange(newProfile);
  }

  updateProfile(props) {
    let profile = Object.assign(
      this.state.profile,
      {
        relation: this.state.stage === 1 ? "Guest" : "Logged",
      },
      props
    );

    this.setState({
      profile,
    });

    this.props.onChange(profile);
  }

  render() {
    switch (this.state.stage) {
      case 0:
        // Welcome
        return (
          <>
            <button
              className="menu-button"
              onClick={() => {
                this.setState({ stage: 1 });
              }}
            >
              {translate("Guest")}
            </button>
            <button
              className="menu-button main"
              onClick={() => {
                this.setState({ stage: 2 });
              }}
            >
              {translate("Login")}
            </button>
          </>
        );
      case 1:
        // Guest profiler
        return (
          <>
            <ImageSelector
              onChange={(index) => {
                this.updateProfile({
                  image: this.props.images[index],
                  guestImage: index,
                });
              }}
              images={this.props.images.map((image) => {
                return { src: image, alt: "Avatar", className: "avatar" };
              })}
              value={this.state.profile.guestImage}
            />
            <input
              ref={this.guestNameRef}
              type="text"
              onChange={(el) => {
                this.updateProfile({
                  name: el.target.value,
                });
              }}
              value={this.state.profile.name}
              placeholder={translate("Introduce your nick")}
            />
            <button
              className="menu-button main"
              onClick={() => {
                this.logout()
              }}
            >
              {translate("Back")}
            </button>
          </>
        );
      case 2:
        // Login profiler
        return (
          <Login
            onLogin={(profile) => {
              this.updateProfile(profile);
              this.setState({ stage: 3 });
            }}
          />
        );
      case 3:
        return (
          <UserProfile
            onLogout={() => {
              this.logout();
            }}
            profile={this.state.profile}
          />
        );
      default:
        return translate("This should never have happened");
    }
  }
}

export default HumanProfiler;
