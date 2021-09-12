import { Component } from "react";

class ServerCommunications {
  static __currentLoads = 0;
  static callbacks = [];
  static onLoad = (cb) => {
    ServerCommunications.callbacks.push(cb);
  };
  static cancelLoad = (cb) => {
    ServerCommunications.callbacks = ServerCommunications.callbacks.filter((_cb) => cb !== _cb);
  };
  static load() {
    ServerCommunications.__currentLoads++;
    ServerCommunications.callbacks.forEach((cb) => cb(true));
  }
  static unload() {
    ServerCommunications.__currentLoads--;
    if (ServerCommunications.__currentLoads === 0)
      ServerCommunications.callbacks.forEach((cb) => cb(false));
  }

  static fetch(url, options) {
    console.log(url);
    ServerCommunications.load();
    var controller = new AbortController();
    let commonOptions = {
      method: "GET",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    };
    const promise = new Promise((resolve, reject) => {
      fetch(url, { ...commonOptions, ...options, signal: controller.signal })
        .then((response) => {
          return new Promise((resolve) => {
            let text = null,
              json = null;

            function tryResolve() {
              if (text !== null && json !== null) resolve({ text, json });
            }

            response
              .clone()
              .text()
              .then((res) => {
                text = res;
                tryResolve();
              })
              .catch((error) => {
                text = { error };
                tryResolve();
              });
            response
              .json()
              .then((res) => {
                json = res;
                tryResolve();
              })
              .catch((error) => {
                json = { error };
                tryResolve();
              });
          });
        })
        .then((parsedResponse) => {
          ServerCommunications.unload();
          const { json } = parsedResponse;
          if (
            typeof json === "object" &&
            json !== null &&
            "message" in json &&
            json.status === "error"
          ) {
            reject({
              message: json.message,
              status: json.status,
            });
          } else {
            resolve(json);
          }
        })
        .catch((error) => {
          ServerCommunications.unload();
          reject({ status: "error", message: error.message });
        });
    });

    promise.abort = controller.abort;
    return promise;
  }

  static delete(url, data = {}, options = {}) {
    options.method = "DELETE";
    options.body = JSON.stringify(data);
    return ServerCommunications.fetch(url, options);
  }

  static get(url, options = {}) {
    options.method = "GET";
    return ServerCommunications.fetch(url, options);
  }

  static patch(url, data = {}, options = {}) {
    options.method = "PATCH";
    options.body = JSON.stringify(data);
    return ServerCommunications.fetch(url, options);
  }

  static post(url, data = {}, options = {}) {
    options.method = "POST";
    options.body = JSON.stringify(data);
    return ServerCommunications.fetch(url, options);
  }
}

class ServerLoader extends Component {
  state = { loading: true };

  componentDidMount() {
    ServerCommunications.onLoad(this.parseServerStatus);
  }

  componentWillUnmount() {
    ServerCommunications.cancelLoad(this.parseServerStatus);
  }

  parseServerStatus = (loading) => {
    this.setState({ loading });
  };

  render() {
    if (this.state.loading)
      return (
        <div className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      );
    return "";
  }
}

export { ServerCommunications, ServerLoader };
