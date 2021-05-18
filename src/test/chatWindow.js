import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { RiSendPlane2Fill, RiArrowLeftCircleFill } from "react-icons/ri";

class ChatWindow extends Component {
  chatDivRef = React.createRef();

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot && snapshot.shouldScroll) {
      let messages = this.chatDivRef.current;
      messages.scrollTop = messages.scrollHeight;
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (
      prevProps.messages.length < this.props.messages.length ||
      prevProps.messages[0] !== this.props.messages[0]
    ) {
      let messages = this.chatDivRef.current;

      // Prior to getting your messagess.
      let shouldScroll = messages.scrollTop + messages.clientHeight === messages.scrollHeight;
      let currentScroll = messages.scrollTop;

      return { shouldScroll, currentScroll };
    }
    return null;
  }

  render() {
    return (
      <>
        <div className="window-title">
          <button onClick={this.props.onClose}>
            <RiArrowLeftCircleFill size="1.5em" />
          </button>
          <h3>Chat with {this.props.client.name}</h3>
        </div>
        <div className="chat-messages" ref={this.chatDivRef}>
          {this.props.messages.map((message, key) => (
            <div className="chat-message" key={key}>
              <strong>{message.from.name}:</strong>
              <span> {message.body}</span>
            </div>
          ))}
        </div>
        <form
          className="chat-commands"
          onSubmit={(ev) => {
            ev.preventDefault();
            this.props.onSend(this.props.refer.current.value);
            this.props.refer.current.value = "";
            this.props.refer.current.focus();
          }}
        >
          <input disabled={!this.props.enabled} ref={this.props.refer} type="text" />
          <button disabled={!this.props.enabled}>
            <RiSendPlane2Fill />
          </button>
        </form>
      </>
    );
  }
}

ChatWindow.propTypes = {
  messages: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired,
  client: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default ChatWindow;
