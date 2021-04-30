import React, { Component } from "react";
import Selector from "./selector";

class ImageSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value ?? (Math.floor(Math.random() * this.props.images.length))
    }

    if(!props.value)
      this.props.onChange(this.state.value)
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.value !== this.props.value) {
      this.setState({value: this.props.value})
    }      
  }
  

  render() {
    return (
      <Selector
        value={ this.state.value }
        onChange={(val) => {
          this.props.onChange(val);
        }}
        className="image-selector"
        options={this.props.images.map((image) => (
          <img alt="" {...image} />
        ))}
      />
    );
  }
}

export default ImageSelector;
