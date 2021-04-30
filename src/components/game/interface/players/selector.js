import React, { Component } from "react";
import {
  AiFillCaretLeft as IconLeft,
  AiFillCaretRight as IconRight,
} from "react-icons/ai";

class Selector extends Component {
  static defaultProps = {
    className: "",
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.value ?? 0,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.value !== prevProps.value) {
      this.setState({ value: this.props.value });
    }

    if (this.state.value !== prevState.value) {
      this.props.onChange(this.state.value);
    }
  }

  render() {
    return (
      <div className={`selector ${this.props.className}`}>
        <button
          onClick={(e) => {
            e.preventDefault();
            let value = this.state.value;
            value = value === 0 ? this.props.options.length - 1 : value - 1;
            this.setState({
              value,
            });
          }}
        >
          <IconLeft size="1em" />
        </button>
        {this.props.options[this.state.value]}
        <button
          onClick={(e) => {
            e.preventDefault();
            let value = this.state.value;
            value = value === this.props.options.length - 1 ? 0 : value + 1;
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

export default Selector;
