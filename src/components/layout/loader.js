import React, { Component } from "react";
import Modal from "./common/modal/modal";
import { translate } from "./../../resources/common";

export class Loader extends Component {
  static defaultProps = {
    show: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      dots: "",
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({
        dots: this.state.dots === "..." ? "" : this.state.dots + ".",
      });
    }, 400);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      this.props.show && (
        <Modal textAlign="center" canClose={false} show={true}>
          {translate("Loading") + this.state.dots}
        </Modal>
      )
    );
  }
}

export default Loader;
