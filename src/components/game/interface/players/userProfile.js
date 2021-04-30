import React, { Component } from "react";
import { translate } from './../../../../resources/common';

class UserProfile extends Component {
  logout = () => {
    this.props.onLogout()
  }

  render() {
    return (
      <div className="player-profile">
        <img src={this.props.profile.image} alt={translate("User image")} className="avatar" />
        <div>
          <h4>{this.props.profile.name}</h4>
          <button onClick={this.logout} className='menu-button main'>{translate('Logout')}</button> 
        </div>
      </div>
    );
  }
}

export default UserProfile;
