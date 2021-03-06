import ErrorActions from '../actions/ErrorActions';
import ServerStore from '../stores/ServerStore';


var React = require('react'),
  Router = require('react-router'),
  Link   = Router.Link,
  loadStats = {},
  loadData    = [],
  totalPoints = 300,
  loadInterval = 1000,
  updateTimeout = null,
  statsTimeout  = null,
  getTimeout = null;

// Determine the scale for each type of monitoring on y-axis.
var datasetYScale = {
  "key bytes read": {
    scale: 1000000,
    units: "MB/sec"
  },
  "key bytes written": {
    scale: 1000000,
    units: "MB/sec"
  },
  "value bytes read": {
    scale: 1000000,
    units: "MB/sec"
  },
  "value bytes written": {
    scale: 1000000,
    units: "MB/sec"
  },
  "file bytes read": {
    scale: 1000000,
    units: "MB/sec"
  },
  "file bytes written": {
    scale: 1000000,
    units: "MB/sec"
  },
  "handlers active": {
    scale: 1,
    units: "%"
  }
};

var chartOptions = {
  series: { shadowSize: 1 }, // drawing is faster without shadows
  yaxis: { min: 0, max: 100 },
  xaxis: { show: false },
  legend: {
    position: 'nw'
  },
  grid: {
    borderWidth: 1,
    borderColor: '#ccc'
  }
};



var setLoadData = function() {
  var setnum = 0;
  for (var dataset in loadStats) {
    var yscale = datasetYScale[dataset];
    var datasetLabel = dataset;
    if (yscale.units !== null) {
      datasetLabel += " (" + yscale.units + ")";
    }
    loadData[setnum] = {
      label: datasetLabel,
      data: []
    };
    var filler = totalPoints - loadStats[dataset].length;
    for (var x = 0; x < totalPoints; ++x) {
      if (filler > x) {
        loadData[setnum].data.push([x,0]);
      } else {
        var i = x - filler;
        if (i < 0 || i > loadStats[dataset].length) {
          console.log("Bad i:", i, x, filler, loadStats[dataset].length);
        }
        var y = loadStats[dataset][i] / yscale.scale;

        if (y < 0) {
          y = 0;
        }
        if (y > 100) {
          y = 100;
        }
        loadData[setnum].data.push([x, y]);
      }
    }
    ++setnum;
  }
}

var startLoadingStats = function() {

  var getLoadStats = function () {
    ServerStore.getLoad(function(response) {
      for (var dataset in response) {
        if (dataset in datasetYScale) {
          if (!loadStats.hasOwnProperty(dataset) || Object.prototype.toString.call(loadStats[dataset]) !== '[object Array]') {
            loadStats[dataset] = [];
          }
          if (loadStats[dataset].length >= totalPoints) {
            loadStats[dataset] = loadStats[dataset].slice(1);
          }
          loadStats[dataset].push(response[dataset]);
        }
      }
      setLoadData();
    });
    // stop the proliferation of timeouts each time we load the admin page.
    window.clearTimeout(statsTimeout);
    statsTimeout = setTimeout(getLoadStats, loadInterval);
  }

  getLoadStats();
}

var updateLoadStats = function() {
  $.plot($('.usageChart'), loadData, chartOptions).draw();
  updateTimeout = setTimeout(updateLoadStats, loadInterval);
}

class ServerStatus extends React.Component {
  // this gets called after the fist time the component is loaded into the page.
  componentDidMount() {

    startLoadingStats();
    updateLoadStats();
    return;
  }

  componentWillUnmount() {
    // this stops the plot from updating while no one is looking at the page.
    window.clearTimeout(updateTimeout);
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">Monitoring</div>
        <div className="panel-body">
          <div className="usageChart"></div>
        </div>
      </div>
    );
  }
}

module.exports = ServerStatus;
