import { Component } from "react";
import { asDebugable } from 'resources/common';

class AutoReflectChangesComponent extends Component {
  constructor(props) {
    super(props);

    this.updateKey = 0;
    this.debugReflect = false;

    this.state = {}

    asDebugable(this);
  }

  composeUpdateObject(props,copy=false){
    let updated = [];
    let newProps = {};

    for (let key of Object.keys(props)) {
      updated.push(key);

      if (copy)
        switch (props[key].prototype.constructor.name) {
          case "Object":
            newProps[key] = { ...props[key] };
            break;
          case "Array":
            newProps[key] = [...props[key]];
            break;
          default:
            newProps[key] = props[key];
        }
      else newProps[key] = props[key];
    }

    newProps.___updateKey = this.updateKey++;
    newProps.___updated = updated;

    return newProps;
  }

  updateState(props, copy = false) {
    this.debugLevel = Number(this.debugReflect);

    let newProps = this.composeUpdateObject(props,copy);

    this.debug(1,`Order to update received`, newProps, copy);
    this.setState(newProps);
  }

  propertiesDidUpdate(prevProperties) {}

  stateDidUpdate(key, value) {}

  componentDidUpdate(prevProps, prevState) {
    let prevStateType = prevState && typeof prevState.___updateKey;
    if(this.state.___updateKey === undefined) {
      this.updateState(this.state);
    }
    if (
      prevStateType === "number" &&
      prevState.___updateKey !== this.state.___updateKey
    ) {
      this.debug(1,`State update`,this.state.___updated);
      this.debug(1,this.state.___updated);
      for (let key of this.state.___updated) {
        this.debug(1,`New value of '${key}':`, this.state[key]);
        let prevStateProp = key in prevState ? prevState[key] : undefined
        this.stateDidUpdate(key, this.state[key], prevStateProp);
      }
    }
  }
}

export { AutoReflectChangesComponent }