var React       = require('react'),
  Router        = require('react-router'),
  Route         = Router.Route,
  NotFoundRoute = Router.NotFoundRoute,
  DefaultRoute  = Router.DefaultRoute,
  Link          = Router.Link,
  RouteHandler  = Router.RouteHandler,
  Home          = require('./Home.react'),
  NotFound      = require('./NotFound.react'),
  Nav           = require('./Navigation.react'),
  Admin         = require('./Admin.react'),
  About         = require('./About.react'),
  Error         = require('./Error.react');

import Repo from './Repo.react';
import TileMap from './TileMap.react';

class ConsoleApp extends React.Component {
  render() {
    return (
      <div>
        <Nav />
        <div className="container-fluid">
          <Error/>
          {/* this is the important part for route handling */}
          <RouteHandler/>
        </div>
      </div>
    );
  }
}

var routes = (
  <Route name="consoleapp" path="/" handler={ConsoleApp}>
    <DefaultRoute handler={Home}/>
    <Route name="admin" path="admin" handler={Admin}/>
    <Route name="about" path="about" handler={About}/>
    <Route name="repo"  path="repo/:uuid"  handler={Repo}/>
    <Route name="tilemap" path="/repo/:uuid/ts/:tileSource/ls/:labelSource" handler={TileMap}/>
    <Route name="tilemapwithcoords" path="/repo/:uuid/ts/:tileSource/ls/:labelSource/:plane/:coordinates" handler={TileMap}/>
    <NotFoundRoute handler={NotFound}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});

module.exports = ConsoleApp;