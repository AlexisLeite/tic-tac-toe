import React, { Component } from "react";

export class Statusbar extends Component {
  render() {
    let boxes = [];

    let i = 0;
    for (let key in this.props.status) {
      let prop = this.props.status[key];
      if (typeof prop === "object") continue;

      prop = prop + "";
      i++;
      
      boxes.push(
        <span key={i} className="status-box">
          <strong>{key}</strong> {prop}
        </span>
      );
    }

    return <aside className="status-bar">{boxes}</aside>;
  }
}

export default Statusbar;
