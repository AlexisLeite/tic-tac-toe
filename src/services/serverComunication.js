import { exists } from "common";

class ServerCommunications {
  static fetch(uri, options) {
    var controller = new AbortController();
    let commonOptions = {
      method: "GET",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    };
    fetch(uri, { ...commonOptions, ...options, signal: controller.signal })
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
        const { text, json } = parsedResponse;
        if (
          (typeof text === "object" && text !== null && "error" in text) ||
          (typeof json === "object" && json !== null && "error" in json)
        )
          throw parsedResponse;

        //console.log(`Server response fetched on uri ${uri}`, json);
        for (let cb of callbacks) cb({ text, json });
      })
      .catch((error) => {
        console.error("Error on fetching:");
        console.error(error);

        let thrown = false;
        for (let cb of errorcbs) {
          cb(error);
          thrown = true;
        }
        if (!thrown) throw error;
      });

    let callbacks = [],
      errorcbs = [];
    let returnObj = {
      error: (ecb) => {
        if (typeof ecb === "function") errorcbs.push(ecb);
        return returnObj;
      },
      then: (cb) => {
        if (typeof cb === "function") callbacks.push(cb);
        return returnObj;
      },
      cancel: () => {
        controller.abort();
        return returnObj;
      },
    };
    return returnObj;
  }

  static get(uri, options = {}) {
    options.method = "GET";
    return ServerCommunications.fetch(uri, options);
  }

  static post(uri, data = {}, options = {}) {
    options.method = "POST";
    options.body = JSON.stringify(data);
    return ServerCommunications.fetch(uri, options);
  }
}

export { ServerCommunications };
