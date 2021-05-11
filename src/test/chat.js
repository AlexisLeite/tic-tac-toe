import React, { Component } from "react";
import { ServerCommunications } from "services";
import { api } from "common";

class FakeSocket {
  options = {
    _trulyOptions: {
      keepAlive: 5,
    },
    get keepAlive() {
      return this._trulyOptions.keepAlive;
    },
    set keepAlive(value) {
      if (value < 5) value = 5;
      if (value > 20) value = 20;
      this._trulyOptions.keepAlive = value;
    },
  };

  constructor(endpoint, options) {
    Object.assign(this.options, options);

    ServerCommunications.post(endpoint, {
      action: "register",
    }).then((res) => {
      console.log(res);
    });
  }
}

class Chat extends Component {
  constructor(props) {
    super(props);

    this.fakeSocket = new FakeSocket(api("chat/"));
  }

  textAreaRef = React.createRef();
  inputRef = React.createRef();

  sendMessage = () => {
    let message;
    console.log(this.inputRef.current.value);
    this.inputRef.current.value = "";
  };

  render() {
    return (
      <div className="chat">
        <textarea ref={this.textAreaRef}></textarea>
        <form
          className="commands"
          onSubmit={(ev) => {
            ev.preventDefault();
            this.sendMessage();
          }}
        >
          <input type="text" ref={this.inputRef} />
          <button type="submit">Send</button>
        </form>
      </div>
    );
  }
}

export default Chat;
