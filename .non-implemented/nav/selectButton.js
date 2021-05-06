import React, { Component } from "react";
import { IconContext } from "react-icons";
import Modal from "components/layout/common/modal/modal";
import { ucFirst } from "resources/common";
import { FaPalette } from "react-icons/fa";

export class SelectButton extends Component {
  static defaultProps = {
    icon: FaPalette,
    size: "1em",
    options: [],
    onChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };
  }

  toggle = () => {
    this.setState({
      show: !this.state.show,
    });
  };

  render() {
    const IconTag = this.props.icon;
    return (
      <div className="button-selector">
        <IconContext.Provider value={{ size: this.props.size }}>
          <button className="icon" onClick={this.toggle}>
            <IconTag />
            <br />
            {this.props.name}
          </button>
          <Modal
            hasClosed={() => {
              this.setState({ show: false });
            }}
            show={this.state.show}
            title={this.props.title}
          >
            {this.props.options.map((op) => (
              <button
                onClick={() => {
                  this.props.onChange(op);
                }}
                className="button-selector-option"
                key={op}
              >
                {ucFirst(op)}
              </button>
            ))}
          </Modal>
        </IconContext.Provider>
      </div>
    );
  }
}

export default SelectButton;
