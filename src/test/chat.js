import React, { Component } from "react";
import { ServerCommunications } from "services";
import { api, EasyEvents } from "common";
import { Modal } from "components/common";

class FakeSocket {
  options = {
    _trulyOptions: {
      keepAlive: 5,
    },
    get keepAlive() {
      return this._trulyOptions.keepAlive;
    },
    set keepAlive(value) {
      if (value < 1) value = 1;
      this._trulyOptions.keepAlive = value;
    },
  };

  messages = [];

  constructor(endpoint, registerData, options) {
    Object.assign(this.options, options);
    this.endpoint = endpoint;
    this.registerData = registerData;

    EasyEvents.call(this);
    this.addEvents(["message", "connect"]);
  }

  connect() {
    ServerCommunications.post(this.endpoint, {
      action: "register",
      registerData: this.registerData,
    }).then((res) => {
      if (res.status === "ok") {
        // Set the required keep alive time, it's specified by the server
        this.options.keepAlive = res.keepAlive;

        // If the connection was succesfully made, start the fake socket process
        this.hash = res.hash;

        // Shout out the received messages
        this.fireConnect(res);
        this.fireMessage(res.messages);

        // Start the keep alive process
        this.working = true;
        this.fireKeepAlive();
      } else throw Error(res);
    });
  }

  disconnect() {
    this.working = false;
  }

  fireKeepAlive() {
    if (this.working)
      this.keepAliveTimeout = setTimeout(
        (() => {
          ServerCommunications.post(this.endpoint, {
            hash: this.hash,
            action: "post",
            messages: this.messages,
          })
            .then((res) => {
              if (res.status === "ok") {
                for (let message of res.messages) this.fireMessage(message);
                this.fireKeepAlive();
              } else throw Error(res);
            })
            .error((error) => console.warn(error));
          this.messages = [];
        }).bind(this),
        this.options.keepAlive * 1000
      );
  }

  send(message) {
    this.messages.push(message);
  }
}

class Chat extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    logged: false,
    messages: [],
  };

  textAreaRef = React.createRef();
  inputRef = React.createRef();
  loginRef = React.createRef();

  componentDidMount() {
    this.loginRef.current.focus();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.logged === false && this.state.logged === true) this.inputRef.current.focus();
  }

  login() {
    this.fakeSocket = new FakeSocket(api("chat/"), {
      user: this.loginRef.current.value,
    });
    this.fakeSocket.onConnect((res) => {
      this.setState({ logged: true });
    });
    this.fakeSocket.onMessage((message) => this.parseMessage(message));
    this.fakeSocket.connect();
  }

  parseMessage(data) {
    console.log(data);
    if ("message" in data) {
      this.setState({
        messages: [
          ...this.state.messages,
          { message: data.message, from: data.emitter.registerData.user },
        ],
      });
    }
  }

  sendMessage = () => {
    this.fakeSocket.send(this.inputRef.current.value);
    this.inputRef.current.value = "";
  };

  componentWillUnmount() {
    this.fakeSocket.disconnect();
  }

  render() {
    return (
      <>
        {!this.state.logged && (
          <Modal title="Login" className="chat">
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                this.login();
              }}
            >
              <input ref={this.loginRef} type="text" placeholder="Name" />
              <button type="submit">Login</button>
            </form>
          </Modal>
        )}
        <div className="chat">
          <div className="chat-body">
            {this.state.messages.map((message, index) => (
              <div key={index} className="message">
                <strong>{message.from}:</strong> {message.message}
              </div>
            ))}
          </div>
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
      </>
    );
  }
}

export default Chat;
