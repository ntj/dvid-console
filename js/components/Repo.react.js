import React from 'react';
import Router from 'react-router';
import ServerStore from '../stores/ServerStore';
import ServerActions from '../actions/ServerActions';
import AltContainer from 'alt/AltContainer';
import moment from 'moment';
import RepoDAG from './RepoDAG.react.js';


class LogEntry extends React.Component {
  render(){
    var entry = this.props.entry.split(/\s(.+)/);
    return (
      <tr>
        <td className="timestamp">{moment(entry[0]).format("MMM Do YYYY, h:mm:ss a")}</td>
        <td>{entry[1]}</td>
      </tr>
    );
  }
}


class RepoLog extends React.Component {

  render(){
    this.props.log.reverse();
    return (
      <div className="log">
        <table>
          <tbody>
            {this.props.log.map(function(entry, i) {
              return <LogEntry key={i} entry={entry}/>
            })}
          </tbody>
        </table>
      </div>
    );
  }

}

class RepoDetails extends React.Component {
  render() {
    if (this.props.repos && this.props.repos.hasOwnProperty(this.props.uuid)) {
      var repo = this.props.repos[this.props.uuid];
      var oldest = moment(repo.Log[0].split(' ', 1)[0]);
      var newest = moment(repo.Log[repo.Log.length -1].split(' ', 1)[0]);
      var span = moment.duration(newest.diff(oldest)).humanize();

      return (
        <div>
          <div className="repometa row">
            <div className="col-sm-6">
              <h3>{repo.Alias || "<Nameless Repo>"}</h3>
              <p>{repo.Description}</p>
            </div>
            <div className="col-sm-6 text-right">
              <p><b>UUID:</b> {repo.Root}</p>
              <p><b>Created:</b> {moment(repo.Created).format("MMM Do YYYY, h:mm:ss a")}</p>
              <p><b>Updated:</b> {moment(repo.Updated).format("MMM Do YYYY, h:mm:ss a")}</p>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
              <p><b>Log:</b></p>
            </div>
            <div className="col-sm-6 text-right">
              <p>{repo.Log.length} entries covering {span}</p>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <RepoLog log={repo.Log}/>
            </div>
          </div>

            <RepoDAG dag={repo.DAG}/>

        </div>
      );
    }

    return (
      <div></div>
    );
  }
}


class Repo extends React.Component {
  componentDidMount() {
    ServerActions.fetch();
  }

  render() {
    return (
      <AltContainer store={ServerStore} >
        <RepoDetails uuid={this.props.params.uuid}/>
      </AltContainer>
    );
  }
}

module.exports = Repo;
