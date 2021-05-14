import { ServerCommunications } from "services";
import { api, EasyEvents } from "common";

export class FakeSocket {
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
  knownClients = {};

  constructor(endpoint, registerData, options) {
    Object.assign(this.options, options);
    this.endpoint = endpoint;
    this.registerData = registerData;

    EasyEvents.call(this);
    this.addEvents(["message", "connect", "clientConnect", "clientDisconnect"]);
  }

  connect() {
    ServerCommunications.post(this.endpoint, {
      action: "register",
      registerData: this.registerData,
    })
      .then((res) => {
        res = res.json;
        if (res.status === "ok") {
          // If the connection was succesfully made, start the fake socket process
          this.hash = res.hash;

          // Shout out the received messages
          this.fireConnect(res);

          // Start the keep alive process
          this.working = true;
          this.fireKeepAlive();

          this.parseSuccessfulAnswer(res);
        } else throw Error(`Unexpected server answer: ${res}`);

        window.onbeforeunload = () => this.disconnect();
      })
      .error((error) => {
        console.error("Error on connecting");
        console.log(error.text);
      });
  }

  async disconnect() {
    this.working = false;
    await ServerCommunications.post(this.endpoint, {
      hash: this.hash,
      action: "disconnect",
    });
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
            .then(({ json: res }) => {
              if (res.status === "ok") {
                this.parseSuccessfulAnswer(res);
                this.fireKeepAlive();
              } else {
                console.error("Unexpected server answer", res);
              }
            })
            .error((error) => console.log(error.text));
          this.messages = [];
        }).bind(this),
        this.options.keepAlive * 1000
      );
  }

  parseSuccessfulAnswer(res) {
    // Apply configurations
    if ("keepAlive" in res) this.options.keepAlive = res.keepAlive;

    // Notice of messages to the client's app
    for (let message in res.messages) this.fireMessage(res.messages[message]);

    // Keep the client's list updated
    if ("clientsList" in res) {
      for (let clientUpdate of res.clientsList) {
        switch (clientUpdate.status) {
          case "connect":
            this.knownClients[clientUpdate.hash] = clientUpdate.registerData;
            this.fireClientConnect(clientUpdate);
            break;
          case "disconnect":
            if (clientUpdate.hash in this.knownClients) {
              this.fireClientDisconnect({
                hash: clientUpdate.hash,
                registerData: this.knownClients[clientUpdate.hash],
              });
              delete this.knownClients[clientUpdate.hash];
            }
            break;
        }
      }
    }
  }

  send(message) {
    this.messages.push(message);
  }
}
