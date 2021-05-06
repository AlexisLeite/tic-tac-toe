import React, { Component } from "react";
import {
  AiFillCaretLeft as IconLeft,
  AiFillCaretRight as IconRight,
} from "react-icons/ai";
import { PropTypes } from "prop-types";

class Selector extends Component {
  static defaultProps = {
    className: "",
    map: (value) => value,
    onChange: (index, value) => {},
    options: [],
    value: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
    };

    this.shoutChange();
  }

  componentDidUpdate(prevProps, prevState) {
    let currentOptions = this.props.options.map((el) => this.props.map(el));
    let previousOptions = prevProps.options.map((el) => this.props.map(el));
    let shoutChanges = false;

    if (currentOptions.length !== previousOptions.length) {
      let index = currentOptions.indexOf(previousOptions[this.state.value]);
      if (index !== -1 && index !== this.state.value)
        this.setState({ value: index });
      else if (this.state.value >= this.props.options.length)
        this.setState({ value: this.props.options.length - 1 });
      else shoutChanges = true;
    }

    if (prevState.value !== this.state.value || shoutChanges) {
      this.shoutChange();
    }
  }

  shoutChange() {
    this.props.onChange(this.state.value, this.props.options[this.state.value]);
  }

  render() {
    return (
      <div className={`selector ${this.props.className}`}>
        <button
          onClick={(e) => {
            let value = this.state.value;
            value = value - 1 < 0 ? this.props.options.length - 1 : value - 1;
            this.setState({
              value,
            });
          }}
        >
          <IconLeft size="1em" />
        </button>
        {this.props.options[this.state.value] &&
          this.props.map(this.props.options[this.state.value])}
        <button
          onClick={(e) => {
            let value = this.state.value;
            value = value + 1 >= this.props.options.length ? 0 : value + 1;
            this.setState({
              value,
            });
          }}
        >
          <IconRight size="1em" />
        </button>
      </div>
    );
  }
}

Selector.propTypes = {
  value: PropTypes.number,
  map: PropTypes.func,
  onChange: PropTypes.func,
  options: PropTypes.array,
};

export { Selector };
