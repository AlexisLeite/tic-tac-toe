import React, { Component } from "react";
import { ThemeContext } from "components/layout/layout";
import { FaPalette } from "react-icons/fa";
import SelectButton from "./selectButton";
import { translate } from './../../resources/common';

export class ThemeSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };
  }

  toggleTheme = (op, theme) => {
    theme.toggle(op);
  };

  toggle = () => {
    this.setState({
      show: !this.state.show,
    });
  };

  hide = () => {
    this.setState({
      show: false,
    });
  };

  render() {
    return (
      <ThemeContext.Consumer>
        {(theme) => (
          <SelectButton
            icon={FaPalette}
            options={theme.themes}
            onChange={op=>this.toggleTheme(op,theme)}
            size={theme.sizes.icons}
            name={translate('Theme')}
            title={translate('Choose theme')}
          />
        )}
      </ThemeContext.Consumer>
    );
  }
}

export default ThemeSelector;
