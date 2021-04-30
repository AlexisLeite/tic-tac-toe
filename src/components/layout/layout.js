import React, { Component } from "react";
import Aside from "./aside";
import { translate } from './../../resources/common';

export const ThemeContext = React.createContext({
  theme: translate("light"),
  toggleTheme: () => {},
});

export class Layout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      theme: translate("light"),
      themeContext: {
        themes: [translate("dark"), translate("light")],
        toggle: this.toggleTheme,
        sizes: {
          icons: '7vw'
        }
      },
    };

    this.toggleTheme(this.state.theme)
  }

  toggleTheme = theme => {
    document.body.className=theme
  }

  render() {
    return (
      <ThemeContext.Provider value={this.state.themeContext}>
        <Aside>{this.props.aside}</Aside>
        { this.props.children }
      </ThemeContext.Provider>
    );
  }
}

export default Layout;
