import React, { Component } from "react";
import { AiFillCaretLeft as IconLeft, AiFillCaretRight as IconRight } from "react-icons/ai";
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
      value: props.value < props.options.length ? props.value : 0,
    };

    this.shoutChange();
  }

  componentDidUpdate(prevProps, prevState) {
    let currentOptions = this.props.options.map((el) => this.props.map(el));
    let previousOptions = prevProps.options.map((el) => this.props.map(el));

    /** Situations where the changes affect:
     *
     *  - Options changed, those will always change from props
     *  - Value is changed in state
     *  - Value is changed in props
     */

    // Options changed in props
    if (previousOptions.length !== currentOptions.length) {
      let prevValue = previousOptions[prevState.value];

      // If the previous value is still present, then keep it
      if (currentOptions.includes(prevValue))
        return this.setState({ value: currentOptions.indexOf(prevValue) });

      // If the previos value is not present, prevent value from being invalid
      if (this.state >= currentOptions.length)
        return this.setState({ value: currentOptions.length - 1 });
    }

    // Value changed in state
    if (prevState.value !== this.state.value) this.shoutChange();

    // Value changed in properties and it's a correct value
    if (
      prevProps.value !== this.props.value &&
      this.props.value !== this.state.value &&
      this.inBoundaries(this.props.value)
    )
      return this.setState({ value: this.props.value });
  }

  inBoundaries(value) {
    return value >= 0 && value < this.props.options.length;
  }

  shoutChange() {
    if (this.inBoundaries(this.state.value)) {
      this.props.onChange(this.state.value, this.props.options[this.state.value]);
    }
  }

  render() {
    return (
      <div className={`selector ${this.props.className}`}>
        <button
          className="selector-button"
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
          className="selector-button"
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
