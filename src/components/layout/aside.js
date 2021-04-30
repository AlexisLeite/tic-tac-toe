import React, { Component } from "react";

export class Aside extends Component {
  constructor(props) {
    super(props);

    this.showClassName = "";
    this.hideClassName = "hide";

    this.mouseInside = false;

    this.state = {
      show: this.hideClassName,
    };
  }

  close = () => {
    this.setState({
      show: this.hideClassName,
    });
  };

  scheduleClose = () => {
    this.mouseInside = false;
    setTimeout(() => {
      if (!this.mouseInside) this.close();
    }, 2000);
  };

  toggle = () => {
    this.setState({
      show:
        this.state.show === this.showClassName
          ? this.hideClassName
          : this.showClassName,
    });
  };

  render() {
    return (
      <aside
        onMouseEnter={() => {
          this.mouseInside = true;
        }}
        onMouseLeave={this.scheduleClose}
      >
        <div className={this.state.show}>{this.props.children}</div>
        <div onClick={this.toggle} className="hider">
          <button>...</button>
        </div>
      </aside>
    );
  }
}

export default Aside;
