import React from 'react';
import { withRouter } from 'react-router';

class ChatHeader extends React.Component {
  constructor(props){
    super(props);
    this.toggleDetailView = this.toggleDetailView.bind(this);
  }

  componentDidMount(){
    if(this.props.channelId !== ':messageId'){
      this.props.fetchChannelUsers(this.props.channelId);
    }
  }

  shouldComponentUpdate(newProps){
    if(this.props.channel && !newProps.channel.users){
      this.props.fetchChannelUsers(newProps.channelId);
      return true;
    } else if (newProps.channel.users) {
      return true;
    } else {
      return false;
    }
  }

  toggleDetailView() {
      const channelId = this.props.channelId;

      if (this.props.location.pathname.endsWith("details")) {
        this.props.history.push(`/messages/${channelId}`);
      } else {
        this.props.history.push(`/messages/${channelId}/details`);
      }
  }

  render(){
    let channel;
    let channelName;
    let userCount;
    if(this.props.channel && this.props.channel.users){
      channel = this.props.channel;
      channelName = channel.private ? "@" + channel.name : "#" + channel.name;
      userCount = channel.users.length;
    }

    return (
      <header id="chat-team-header">
        <div id="chat-header-content">
          {channelName}
          <br />
          <span id="detail-view-toggle" onClick={this.toggleDetailView}>
            <i id="channel-count-of-users" className="fa fa-user-o" aria-hidden="true"></i>
            <span id="channel-count-of-users" >{userCount}</span>
          </span>
        </div>
      </header>
    );
  }
}

export default withRouter(ChatHeader);
