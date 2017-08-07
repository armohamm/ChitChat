import React from 'react';
import moment from 'moment';
import ReactEmoji from 'react-emoji';
import AlertContainer from 'react-alert';
import EmoticonList from './emoticon_list';

class ChatListItem extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      _id: this.props.message._id,
      userId: this.props.message.userId,
      channelId: this.props.message.channelId,
      content: this.props.message.content,
      showEditForm: false,
      emoticonListOpen: false,
      icon: "",
      messageButtonClass: "message-buttons invisible",
      deleteModalClass: "delete-modal hidden"
     };

     this.alertOptions = {
      offset: 25,
      position: 'bottom left',
      theme: 'dark',
      time: 0,
      transition: 'scale'
    };

    this.toggleEmoticonDisplay = this.toggleEmoticonDisplay.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.editMessage = this.editMessage.bind(this);
    this.toggleEditForm = this.toggleEditForm.bind(this);
    this.updateContent = this.updateContent.bind(this);
    this.addEmoticon = this.addEmoticon.bind(this);
    this.emoticonReactions = this.emoticonReactions.bind(this);
    this.openDeleteModal = this.openDeleteModal.bind(this);
    this.closeDeleteModal = this.closeDeleteModal.bind(this);
  }

  openDeleteModal(){
    if (this.props.currentUser._id !== this.props.message.userId._id){
      this.showAlert("You don't have delete privileges for this message!");
    } else {
      this.setState({deleteModalClass: "delete-modal"});
    }
  }

  closeDeleteModal(){
    this.setState({deleteModalClass: "delete-modal hidden"});
  }

  toggleEmoticonDisplay(){
    if(this.state.messageButtonClass.indexOf("invisible") > -1){
      this.setState({messageButtonClass: "message-buttons"});
    } else{
      this.setState({messageButtonClass: "message-buttons invisible"});
    }

    this.setState({ emoticonListOpen: !this.state.emoticonListOpen });
  }

  addEmoticon(emoticon){
    let duplicate = false;
    const userId = this.props.currentUser._id;
    this.props.message.emoticons
      .forEach((icon) => {
        if(icon.userId === userId && icon.icon === emoticon){
          duplicate = true;
        }
      });

    if(!duplicate){
      this.setState({
        content: this.state.content + " " + emoticon,
        icon: emoticon,
      });

      const emoticonState = {
        userId: this.props.currentUser._id,
        messageId: this.props.message._id,
        icon: emoticon
      };

      this.props.createEmoticon(emoticonState).then((message) => {
        this.props.socket.emit('broadcast emoticon',
        { channel: this.props.channelId, message: message });
      });
    }
  }

  updateContent(e) {
    this.setState( {content: e.currentTarget.value} );
  }

  handleInput(e){
    e.preventDefault();
    this.setState({content: e.target.value});
  }

  deleteMessage(e){
    e.preventDefault();
    if (this.props.currentUser._id !== this.props.message.userId._id) {
      this.showAlert("You don't have delete privileges for this message!");
    } else {
      this.props.deleteMessage(this.props.message._id);
    }
  }

  componentDidUpdate(){
    if ($(".emoticon-form span").first().offset() && $(".emoticon-form span").first().offset().top < 40){
      const oldTop = $(".emoticon-form span").first().offset().top;
      const oldLeft = $(".emoticon-form span").first().offset().left;
      $(".emoticon-form span").first().offset({top: oldTop + 300, left: oldLeft - 60 });
    }
  }

  toggleEditForm(){
    if (this.props.currentUser._id !== this.props.message.userId._id) {
      this.showAlert("You don't have edit privileges for this message!");
    } else {
      this.setState({showEditForm: !this.state.showEditForm});
    }
  }

  editMessage(e){
    e.preventDefault();
    if (this.props.currentUser._id !== this.props.message.userId._id) {
      this.showAlert("You don't have edit privileges for this message!");
    } else {
      this.toggleEditForm();
      this.props.updateMessage(this.state);
    }
  }

  emoticonReactions(emoticons){
    if (emoticons.length === 0) { return ""; }
    let counts = {};
    emoticons.forEach((emoticon) => {
      let icon = emoticon.icon;
      if(counts[icon]){
        counts[icon]++;
      } else {
        counts[icon] = 1;
      }
    });

    return Object
      .keys(counts)
      .map((icon, idx) => (
        <div id="reaction"
          key={`reaction-${idx}`}
          onClick={() => this.addEmoticon(icon)}>
          {ReactEmoji.emojify(icon)}
          {counts[icon]}
        </div>
      ));
  }

  showAlert(text){
    this.msg.show(text, {
      time: 2500,
      type: 'info'
    });
  }

  render(){
    const time = moment(this.props.message.createdAt).format('h:mm a');
    let emoticonList;
    let messageContent = (
      <p id="message-text">
        {ReactEmoji.emojify(this.props.message.content)}
      </p> );
    const reactions = this.emoticonReactions(this.props.message.emoticons);

    if(this.state.emoticonListOpen){
      emoticonList = <EmoticonList
        className="emoji-picker-display"
        addEmoticon={this.addEmoticon}
        toggleEmoticonDisplay={this.toggleEmoticonDisplay} />;
    }

    if(this.props.message.content.startsWith("giphy")) {
      const endOfImageUrl = this.props.message.content.indexOf("gif") + 3;
      const messageGif = this.props.message.content.slice(6, endOfImageUrl);
      messageContent = (
        <div>
          <div id="gif-container">
            <div id="left-gif-bar"></div>
            <img id="gif-message" src={messageGif}/>
          </div>
        </div>
      );
    } else if(this.state.showEditForm) {
      messageContent = <form onSubmit={ this.editMessage }>
        <input
           id="message-content-input"
           onChange={this.updateContent}
           type="text"
           value={this.state.content}/>
       </form>;
    }

    const messageItem = (
      <div className="message-content-container">
        <img className="message-avi" src={this.props.message.userId.aviUrl }/>
        <div className="message-content">
          <span className="message-author">{this.props.message.userId.username}</span> <span className="message-time">{time}</span>
          <br />
          <span className="message-words">{messageContent}</span>
          <div id="reaction-list">
            {reactions}
          </div>
        </div>
      </div>
    );

    const alert = (
      <AlertContainer id="alert-container"
        ref={a => this.msg = a} {...this.alertOptions} />
    );

    const buttons = (
      <span className={this.state.messageButtonClass}>
        <i className="fa fa-smile-o fa-6" aria-hidden="true" onClick={this.toggleEmoticonDisplay}></i>
        <i className="fa fa-pencil-square-o fa-6" aria-hidden="true" onClick={this.toggleEditForm}></i>
        <i className="fa fa-times-circle-o fa-6" aria-hidden="true" onClick={this.openDeleteModal}></i>
      </span>
    );

    const modal = (
      <div className={this.state.deleteModalClass}>
        <div className="delete-modal-content">
          <div className="delete-modal-header">
            <h2>Delete message</h2>
          </div>
          <br/>
          <div className="delete-modal-body">
            <p>Are you sure you want to delete this message? This cannot be undone.</p>
            <br/>
            <div className="delete-modal-message-item">
              {messageItem}
            </div>
            <br/>
            <div className="delete-modal-buttons">
              <button className="delete-modal-cancel-button" onClick={this.closeDeleteModal}>
                Cancel
              </button>
              <button id="delete-modal-button" onClick={this.deleteMessage}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return(
      <li className="chat-message">
        {messageItem}
        {emoticonList}
        {alert}
        {buttons}
        {modal}
      </li>
    );
  }
}

export default ChatListItem;
