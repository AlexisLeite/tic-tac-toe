import { Component } from "react";
import { translate } from "common";

export class Loader extends Component {
  static defaultProps = {
    show: true,
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
    return this.props.show && translate("Loading") + this.state.dots;
  }
}
