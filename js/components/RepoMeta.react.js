import React from 'react';
import moment from 'moment';
import {Router, Link} from 'react-router';

class RepoMeta extends React.Component {
  render () {
    var repo = this.props.repo;

    return (
      <div className="repometa row">
        <div className="col-sm-6">
          <h3>{repo.Alias || "<Nameless Repo>"}</h3>
          <p>{repo.Description}</p>
        </div>
        <div className="col-sm-6 text-right">
          <p><b>UUID:</b> <Link to="repo" params={{uuid: repo.Root}}>{repo.Root}</Link></p>
          <p><b>Created:</b> {moment(repo.Created).format("MMM Do YYYY, h:mm:ss a")}</p>
          <p><b>Updated:</b> {moment(repo.Updated).format("MMM Do YYYY, h:mm:ss a")}</p>
        </div>
      </div>
    );
  }
}

module.exports = RepoMeta;