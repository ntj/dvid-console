import React from 'react';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt/AltContainer';

class DataInstanceList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showSub: false};
  }

  showHandler() {
    if (this.state.showSub) {
      this.setState({showSub: false});
    } else {
      this.setState({showSub: true});
    }
  }

  render() {
    var rows = [];
    var tileRows = [];

    if (this.props && this.props.repo.DataInstances) {
      var instances = this.props.repo.DataInstances;

      var sorted = [];
      var parents = {};

      var base_key_regex = /^(.*)(_\d)$/;

      var toggleIcon = '+';

      if (this.state.showSub) {
        toggleIcon = '-';
      }

      for (var key in instances) {
        if (instances.hasOwnProperty(key)) {
          var match = base_key_regex.exec(key);
          if (match) {
            sorted.push([key, instances[key], match[1] + '_' + instances[key].Base.TypeName]);
            parents[match[1] + '_' + instances[key].Base.TypeName] = 1;
          }
          else{
            sorted.push([key, instances[key]]);
          }
        }
      }

      // returns the data instances sorted by type then name.
      sorted.sort(function(a,b) {
        var aType = a[1].Base.TypeName;
        var bType = b[1].Base.TypeName;
        // first see if we have the same type of instance
        if (aType === bType) {
          // same instance type, so sort by the instance name.
          if (a[0] > b[0]) return 1;
          if (a[0] < b[0]) return -1;
          return 0;
        } else {
          // sort by the type.
          if (aType < bType) return -1;
          if (aType > bType) return 1;
        }
        return 0;
      });

      // at this point loop over each of the sorted elements and place the ones
      // that are used for the tile viewer in the tileRows array and the others in
      // the rows array, so that we can push them together later and make sure that
      // the data instances that are used in the tile viewer are closer to the top
      // of the page.

      for (var i = 0; i < sorted.length; i++) {
        var type = sorted[i][1].Base.TypeName;
        var isParent = parents[sorted[i][0] + '_' + type];
        if (!this.state.showSub && sorted[i][2]) {
          // don't add the row as we don't want to draw it.
        } else {
          if (type === 'grayscale8' || type === 'multiscale2d' || type === 'uint8blk' || type === 'imagetile' || type === 'googlevoxels' || type === 'labels64' || type === 'labelblk' ) {
            tileRows.push(<DataInstance key={sorted[i][0]} instance={sorted[i][1]} isParent={isParent} uuid={this.props.uuid} show={this.state.showSub}/>);
          } else {
            rows.push(<DataInstance key={sorted[i][0]} instance={sorted[i][1]} isParent={isParent} uuid={this.props.uuid} show={this.state.showSub}/>);
          }
        }
      }

      tileRows.push(rows);

    }

    return (
      <table className="datainstances">
        <thead>
          <tr>
            <td onClick={this.showHandler.bind(this)}>Data Instance [{{toggleIcon}}]</td>
            <td>Type</td>
            <td>Tile Source</td>
            <td>Label Source</td>
          </tr>
        </thead>
        <tbody>
          {tileRows}
        </tbody>
      </table>
    );
  }
}

class DataInstance extends React.Component {
  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  render() {
    var tile_input = '';
    var label_input = '';
    var type = this.props.instance.Base.TypeName;
    var label_class = 'label lbl-' + type;
    var name = this.props.instance.Base.Name;
    var name_url = '/api/node/' + this.props.uuid + '/' + name + '/';
    var info = 'information';

    if (this.props.isParent) {
      name = name + '*';
    }

    if (type == 'keyvalue') {
      name_url += 'keys/0/z';
      info = 'keys';
    }
    else if (type == 'labels64') {
      name_url += 'metadata';
      info = 'metadata';
    }
    else if (type == 'roi') {
      name_url += 'roi';
      info = 'ROI coords';
    }
    else {
      name_url += 'info';
    }

    var name_tooltip = 'Display ' + info;
    var type_url = '/api/node/' + this.props.uuid + '/' + name + '/help';
    var type_tooltip = 'Display ' + type + ' help';

    if (type === 'grayscale8' || type === 'multiscale2d' || type === 'uint8blk' || type === 'imagetile' || type === 'googlevoxels')
      tile_input = <TileInput name={name}/>;
    else if (type === 'labels64' || type === 'labelblk' || type === 'googlevoxels')
      label_input = <LabelInput name={name}/>;

    return (
      <tr>
        <th><a href={name_url} target="_blank" data-toggle="tooltip" data-placement="right" title={name_tooltip}>{name}</a></th>
        <th><a href={type_url} target="_blank" data-toggle="tooltip" data-placement="right" title={type_tooltip}><span className={label_class}>{type}</span></a></th>
        <td>{tile_input}</td>
        <td>{label_input}</td>
      </tr>
    );
  }
}

class LabelInput extends React.Component {
  render() {
    return (
      <input type="radio" name="label_source" value={this.props.name}></input>
    );
  }
}

class TileInput extends React.Component {
  render() {
    return (
      <input type="radio" name="tile_source" value={this.props.name}></input>
    );
  }
}

class DataInstances extends React.Component {

  render() {
    return (
      <AltContainer store={ServerStore}>
        <DataInstanceList uuid={this.props.uuid}/>
      </AltContainer>
    );
  }
};

module.exports = DataInstances;
