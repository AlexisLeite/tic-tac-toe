import React, { Component } from "react";
import { Selector } from "components/common";
import { PropTypes } from "prop-types";
import { translate } from "common";

class GuestProfiler extends Component {
  static defaultProps = {
    avatars: [],
  };

  inputRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      currentAvatar: -1,
      currentName: "",
      warning: false,
    };
  }

  componentDidMount() {
    this.inputRef.current.focus();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.currentAvatar !== prevState.currentAvatar ||
      this.state.currentName !== prevState.currentName
    ) {
      if (
        this.state.currentAvatar !== -1 &&
        this.state.currentName.length >= 4
      ) {
        // If everything is right,
        this.props.onChange({
          name: this.state.currentName,
          avatar: this.state.currentAvatar,
          relation: "guest",
        });
      } else this.props.onChange(false);

      let showWarning =
        this.state.currentName.length > 0 && this.state.currentName.length < 4;
      if (showWarning && !this.state.warning)
        this.setState({
          warning: translate("4 characters at least"),
        });

      if (this.state.warning && !showWarning) {
        this.setState({ warning: false });
      }
    }
  }

  render() {
    return (
      <>
        <Selector
          options={this.props.avatars}
          map={(avatar) => (
            <img src={avatar} alt="Chosen avatar" className="profile-avatar" />
          )}
          onChange={(index, currentAvatar) => this.setState({ currentAvatar })}
        />
        <input
          type="text"
          placeholder={translate("Introduce your name")}
          onChange={({ target: { value: currentName } }) =>
            this.setState({ currentName })
          }
          ref={this.inputRef}
        />
        {this.state.warning && (
          <div className="warning">{this.state.warning}</div>
        )}
      </>
    );
  }
}

GuestProfiler.propTypes = {
  avatars: PropTypes.arrayOf(PropTypes.string),
  slot: PropTypes.oneOf(["main", "secondary"]).isRequired,
  onChange: PropTypes.func,
};

export default GuestProfiler;
