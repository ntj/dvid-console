import React from 'react';
import {Alert} from 'react-bootstrap';
import ErrorStore from '../stores/ErrorStore';
import ErrorActions from '../actions/ErrorActions';
import AltContainer from 'alt-container';
import {serverMaintenance, serverMaintenanceMessage} from '../utils/config.js';

class ErrorMessage extends React.Component {
  render() {
    if (this.props.errors || serverMaintenance) {
      var message = '';
      if(this.props.errors){
        if (this.props.errors.hasOwnProperty('message')) {
          message = this.props.errors.message;
        } else {
          message = this.props.errors;
        }
      }

      let dismiss = '';
      if(serverMaintenance){
        message = (
          <p>
            {serverMaintenanceMessage}<br/><br/>
            {message}
          </p>);
      }
      else{
        dismiss = this.handleDismiss.bind(this)
      }
      
      if(typeof(message) === "string"){//only wrap strings in p tags, not jsx
        message = <p>{message}</p>;
      }


      return (
        <div className="fixed_alert">
          <Alert bsStyle='danger' onDismiss={dismiss}>
            {message}
          </Alert>
        </div>
      );
    }

    return (
      <div></div>
    );
  }

  handleDismiss() {
    ErrorActions.clear();
  }
}

class Error extends React.Component {
  render() {
    return (
      <AltContainer store={ErrorStore}>
        <ErrorMessage />
      </AltContainer>
    );
  }

};

module.exports = Error;
