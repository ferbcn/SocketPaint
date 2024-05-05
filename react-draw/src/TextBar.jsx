import React, {Component} from 'react'
import './TextBar.css'
import Tooltip from "./Tooltip";

export default class TextBar extends Component {
  constructor (props) {
    super(props)
    this.input = React.createRef()
    this.state = {
      showTooltip: false
    }
  }

  sendMessage () {
    let text = this.input.current.value;
    if (text === '') {
      return;
    }
    this.props.onSend && this.props.onSend(text)
    this.input.current.value = ''
  }
  sendMessageIfEnter (e) {
    if (e.keyCode === 13) {
      this.sendMessage()
    }
  }
  render () {
    const sendMessage = this.sendMessage.bind(this)
    const sendMessageIfEnter = this.sendMessageIfEnter.bind(this)
    const tooltipMessage = this.props.tooltipMessage;
    
    return (
        <div className='textbar'>
          <input className='textbar-input' type='text' ref={this.input}
                 onKeyDown={sendMessageIfEnter}
                 onMouseEnter={() => this.setState({showTooltip: true})}
                 onMouseLeave={() => this.setState({showTooltip: false})}
          />
          {this.state.showTooltip && <Tooltip message={tooltipMessage} />}
          <button className='textbar-send' onClick={sendMessage}>
            Send
          </button>
        </div>
    )
  }
}