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
      .then((res) => res.json())
      .then((jsonRes) => {
        if (exists(jsonRes, "error")) throw jsonRes;
        console.log(`Server response fetched on uri ${uri}`, jsonRes);
        for (let cb of callbacks) cb(jsonRes);
      })
      .catch((error) => {
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
