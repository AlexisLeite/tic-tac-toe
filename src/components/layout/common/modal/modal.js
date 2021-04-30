import React, { Component } from "react";

export class Modal extends Component {
  static defaultProps = {
    // Default placeholders
    title: null,
    children: "Modal text",

    // Events
    hasClosed: () => {},

    // Handling
    canClose: true,
    show: true,

    // Styling
    textAlign: false,

    // Properties
    id: ''
  };

  constructor(props) {
    super(props);

    this.state = {
      show: props.show,
    };
  }

  close = () => {
    if (!this.props.canClose) return;
    
    this.setState({
      show: false,
    });

    this.props.hasClosed();
  };

  componentDidUpdate(prevProps) {
    if (prevProps.show !== this.props.show)
      this.setState({
        show: this.props.show,
      });
  }

  render() {
    return (
      this.state.show && (
        <div onClick={this.close} className="modal-background">
          <div id={this.props.id || '' } style={{textAlign: this.props.textAlign}} className="modal">
            {this.props.title && (
              <div className="modal-header">{this.props.title}</div>
            )}
            <div className="modal-body">{this.props.children}</div>
          </div>
        </div>
      )
    );
  }
}

export default Modal;
