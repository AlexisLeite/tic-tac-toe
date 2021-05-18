import React, { Component } from "react";
import { Modal } from "components/common";
import { FakeSocket } from "./../services/fakeSocket";
import ClientsList from "./clientsList";
import ChatWindow from "./chatWindow";
import { Loader } from "./../components/common/loader";
import { api } from "common";

function makeClientMessagesArray(hash, chat, values = []) {
  let returnObject = [...values];

  Object.defineProperties(returnObject, {
    last: {
      get() {
        if (this.length) return this[this.length - 1];
        else
          return {
            from: { name: "System" },
            body: "No messages",
          };
      },
    },
    hash: {
      value: hash,
    },
    push: {
      value: function (...values) {
        for (let value of values) {
          this[this.length] = value;
          // Only mark as unread if it's not the current chat
          if (this.hash !== chat.state.current) this.unread++;
        }
      },
    },
    unread: {
      value: 0,
      writable: true,
    },
  });

  return returnObject;
}

class Chat extends Component {
  state = {
    logged: false,
    messages: [],
    clients: [],
    current: null,
    windowOpen: false,
  };

  inputRef = React.createRef();
  chatDivRef = React.createRef();

  componentDidMount() {
    if (this.inputRef && this.inputRef.current) this.inputRef.current.focus();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.inputRef && this.inputRef.current) this.inputRef.current.focus();
  }

  componentWillUnmount() {
    //this.fakeSocket.disconnect();
  }

  deleteClient(hash) {
    if (
      !this.state.clients[hash].connected ||
      window.confirm(
        "Are you sure you want to delete this person? This action has no turning back."
      )
    ) {
      if (hash in this.state.clients) {
        let clients = { ...this.state.clients };
        delete clients[hash];

        let messages = { ...this.state.messages };
        delete messages[hash];

        this.setState({
          clients,
          messages,
          current: this.state.current === hash ? "general" : this.state.current,
        });
      }
    }
  }

  lockClient(hash) {
    this.socket.lock(hash);
    let newClients = { ...this.state.clients };
    newClients[hash].messages.push({
      from: "system",
      to: hash,
      body: "The client has been locked",
    });
    newClients[hash].locked = true;
    this.setState({
      clients: newClients,
    });
  }

  unlockClient(hash) {
    this.socket.unlock(hash);
    let newClients = { ...this.state.clients };
    newClients[hash].messages.push({
      from: "system",
      to: hash,
      body: "The client has been unlocked",
    });
    newClients[hash].locked = false;
    this.setState({
      clients: newClients,
    });
  }

  login() {
    // Make the connection
    this.socket = new FakeSocket(api("chat"), {
      name: this.inputRef.current.value,
    });
    this.socket.connect();

    // Parse connection result
    this.socket.onConnect((res) => {
      let { hash, registerData } = res;
      this.client = { hash, name: registerData.name };
      this.parseClientConnect({
        hash: "general",
        registerData: { name: "General" },
      });
      this.setState({
        loadingLogin: false,
        logged: true,
        current: "general",
      });
    });

    // Parse disconnection
    this.socket.onDisconnect((res) => {
      this.setState({
        logged: false,
        messages: [],
        clients: [],
        current: null,
      });
    });

    this.socket.onError((error) => {
      console.error("Error reported on socket");
      console.log(error);
    });

    // Parse received messages
    this.socket.onMessage(this.parseMessage);

    // Parse connected clients
    this.socket.onClientConnect(this.parseClientConnect);

    // Parse disconnected clients
    this.socket.onClientDisconnect(this.parseClientDisconnect);
  }

  logout = () => {
    this.socket.disconnect();
  };

  parseClientConnect = (info) => {
    // Don't parse the connection details of the logged client
    if (info.hash !== this.client.hash) {
      // Define the new client Object
      let clients = {
        ...this.state.clients,
        [info.hash]: {
          ...info.registerData,
          connected: true,
          locked: false,
        },
      };
      let self = this;
      Object.defineProperties(clients[info.hash], {
        messages: {
          get() {
            return self.state.messages[info.hash];
          },
        },
        hash: {
          value: info.hash,
        },
      });

      // Define the messages object
      let messages = {
        ...this.state.messages,
        [info.hash]: makeClientMessagesArray(info.hash, self),
      };

      // Update the state
      this.setState({ clients, messages });
    }
  };

  parseClientDisconnect = (info) => {
    if (info.hash in this.state.clients) {
      let newClients = { ...this.state.clients };
      if (newClients[info.hash].messages.length > 0) {
        newClients[info.hash].messages.push({
          from: "system",
          to: info.hash,
          body: "The client has been disconnected",
        });
        newClients[info.hash].connected = false;
      } else delete newClients[info.hash];
      this.setState({
        clients: newClients,
      });
    }
  };

  parseMessage = (messagePackage) => {
    let message = messagePackage.message;
    if (message.from === this.client.hash) message.from = this.client;
    else if (message.from in this.state.clients) message.from = this.state.clients[message.from];
    else {
      return;
    }

    // Set the correct receipt
    let receipt;
    switch (messagePackage.kind) {
      case "private":
        if (message.to === this.client.hash) receipt = message.from.hash;
        else if (message.to in this.state.messages) receipt = this.state.clients[message.to].hash;
        else {
          return;
        }
        break;
      default:
        receipt = "general";
        break;
    }

    console.log(this.state.messages[receipt], this.state.messages, receipt);
    let receiptMessages = makeClientMessagesArray(receipt, this, [...this.state.messages[receipt]]);
    receiptMessages.push(message);
    let messages = { ...this.state.messages, [receipt]: receiptMessages };
    this.setState({ messages });
  };

  sendMessage(message, to = null) {
    message = {
      body: message,
      from: this.client.hash,
      to,
    };
    if (to === "general") delete message.to;

    this.socket.send(message);
  }

  render() {
    return (
      <div id="Chat">
        {this.state.logged || (
          <Modal id="ChatLogin" canClose={false} centeredFlex={true}>
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                this.login();
                this.setState({ loadingLogin: true });
              }}
            >
              <h1>Welcome</h1>
              <div>
                <input type="text" placeholder="Name" ref={this.inputRef} />
                <button>Login</button>
                {this.state.loadingLogin && <Loader />}
              </div>
            </form>
          </Modal>
        )}
        {this.state.logged && (
          <>
            <div id="ClientsList">
              <div id="ClientInfoCard">
                Welcome {this.client.name}. <button onClick={this.logout}>Logout</button>
              </div>
              <ClientsList
                clients={this.state.clients}
                onSelect={(client) => {
                  let messages = { ...this.state.messages };
                  messages[client].unread = 0;
                  this.setState({ current: client, messages, windowOpen: true });
                }}
                onDelete={(client) => {
                  this.deleteClient(client);
                }}
                onLock={(client) => {
                  this.lockClient(client);
                }}
                onUnlock={(client) => {
                  this.unlockClient(client);
                }}
              />
            </div>
            <div id="ChatWindow" className={this.state.windowOpen === true ? "open" : ""}>
              <ChatWindow
                client={this.state.clients[this.state.current]}
                messages={this.state.messages[this.state.current]}
                onClose={() => this.setState({ windowOpen: false })}
                onSend={(message) => this.sendMessage(message, this.state.current)}
                refer={this.inputRef}
                enabled={
                  this.state.clients[this.state.current] &&
                  this.state.clients[this.state.current].connected &&
                  !this.state.clients[this.state.current].locked
                }
              />
            </div>
          </>
        )}
      </div>
    );
  }
}

export default Chat;
