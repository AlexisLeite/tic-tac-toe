import React, { Component } from "react";
import { Modal } from "components/common";
import { FakeSocket } from "./../services/fakeSocket";

class Chat extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    logged: false,
    messages: [],
    clients: [],
  };

  textAreaRef = React.createRef();
  inputRef = React.createRef();
  loginRef = React.createRef();
  chatDivRef = React.createRef();

  componentDidMount() {
    this.loginRef.current.focus();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.logged === false && this.state.logged === true) this.inputRef.current.focus();
  }

  login() {
    /* this.fakeSocket = new FakeSocket(api("fakeSocket/"), { */
    this.fakeSocket = new FakeSocket("http://192.168.1.4/fakeSocket", {
      user: this.loginRef.current.value,
    });
    this.fakeSocket.onConnect((res) => {
      this.setState({ logged: true });
    });
    this.fakeSocket.onMessage((message) => this.parseMessage(message));

    this.fakeSocket.onClientConnect(this.parseConnect.bind(this));
    this.fakeSocket.onClientDisconnect(this.parseDisconnect.bind(this));

    this.fakeSocket.connect();
  }

  parseConnect(info) {
    let clients = this.state.clients;
    clients[info.hash] = info.registerData;
    this.setState({ clients });
  }

  parseDisconnect(info) {
    if (info.hash in this.state.clients) {
      let clients = this.state.clients;
      delete clients[info.hash];
      this.setState({ clients });
    }
  }

  parseMessage(data) {
    switch (data.kind) {
      case "broadcast":
        data = data.message;
        let newMessagesObject = [
          ...this.state.messages,
          { message: data.message, from: data.emitter.user },
        ];

        // Keep the messages listed above 50
        if (newMessagesObject.length > 50)
          newMessagesObject.splice(0, newMessagesObject.length - 50);

        this.setState({
          messages: newMessagesObject,
        });
        break;
    }
  }

  sendMessage = () => {
    this.fakeSocket.send(this.inputRef.current.value);
    this.inputRef.current.value = "";
    this.inputRef.current.focus();
  };

  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (
      prevState.messages.length < this.state.messages.length ||
      prevState.messages[0] !== this.state.messages[0]
    ) {
      let messages = this.chatDivRef.current;

      // Prior to getting your messagess.
      let shouldScroll = messages.scrollTop + messages.clientHeight === messages.scrollHeight;
      let currentScroll = messages.scrollTop;

      return { shouldScroll, currentScroll };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot && snapshot.shouldScroll) {
      let messages = this.chatDivRef.current;
      messages.scrollTop = messages.scrollHeight;
    }
  }

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
          <div className="chat-body" ref={this.chatDivRef}>
            {this.state.messages.map((message, index) => (
              <div key={index} className="message">
                <strong>{message.from}:</strong> {message.message}
              </div>
            ))}
          </div>
          <div className="chat-users">
            {Object.keys(this.state.clients).map((key) => {
              return (
                <button onClick={() => console.log(key)}>{this.state.clients[key].user}</button>
              );
            })}
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
