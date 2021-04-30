import React, { Component } from "react";
import { translate } from "./../../../../resources/common";
import PlayersService from 'resources/playersService';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nick: "",
      pass: "",
    };

    this.nickInputRef = React.createRef();
  }

  componentDidMount() {
    this.nickInputRef.current.focus();
  }
  

  tryLogin() {
    const result = PlayersService.login(this.state.nick, this.state.pass);

    if(result)
      this.props.onLogin(result);
  }

  render() {
    return (
      <div id="LoginForm">
        <h4>{translate("Introduce your credentials")}</h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            this.tryLogin();
          }}
        >
          <input
            type="text"
            ref={this.nickInputRef}
            onChange={(ev) => {
              this.setState({ nick: ev.target.value });
            }}
            value={this.state.nick}
            placeholder={translate("Introduce nick")}
          />
          <input
            type="password"
            onChange={(ev) => {
              this.setState({ pass: ev.target.value });
            }}
            value={this.state.pass}
            placeholder={translate("Introduce password")}
          />
          <button className="menu-button main" type="submit">
            {translate("Login")}
          </button>
        </form>
      </div>
    );
  }
}

export default Login;
