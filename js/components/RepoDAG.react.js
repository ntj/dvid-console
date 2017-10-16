import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router';
import d3 from 'd3';
import dagreD3 from 'dagre-d3';
import LogActions from '../actions/LogActions';
import ServerActions from '../actions/ServerActions';
import InstanceActions from '../actions/InstanceActions';
import ServerStore from '../stores/ServerStore';
import AltContainer from 'alt-container';
import ErrorActions from '../actions/ErrorActions';
import ModalActions from '../actions/ModalActions';
import {ModalTypes} from '../stores/ModalStore';
import DAGmodals from '../components/DAGmodals.react.js';
import stringify from 'json-stable-stringify';
import VersionDropdown from '../lite-components/VersionDropdown.react.js';
import BranchDropdown from '../lite-components/BranchDropdown.react.js';

var dag, elementHolderLayer, svgBackground;


if (typeof mydagrepo == "undefined") {
  var mydagrepo = {};
};

// returns a list of all predecessors of a parent node / more or less tail recursive function
mydagrepo.findAllPredecessors = function(node, predecessorsList) {
  predecessorsList = predecessorsList || [];
  if (dag.predecessors(node)){
    dag.predecessors(node).forEach(function (n) {
      //some nodes can be visited more than once so this removes them
      if (predecessorsList.indexOf(n) == -1) {
        predecessorsList.push(n);
      }
      mydagrepo.findAllPredecessors(n, predecessorsList);
    });
  }
  else{
    console.log('no predecessors for node' + node);
  }
  return predecessorsList;
};

mydagrepo.getNodeByVersionID = function(that, props, versionId){
  var nodes = props.repo.DAG.Nodes;
  var keys = Object.keys(nodes);
  for (var k = 0; k < keys.length; k++){
    if(nodes[keys[k]].VersionID == versionId){
      return nodes[keys[k]].UUID;
    }
  }
};

mydagrepo.nodeList = null;

mydagrepo.resetGraph = function(dag){
  // test if the number of nodes in current dag is different from initial number
  var backupKeys = Object.keys(mydagrepo.nodeList);
  var dagKeys = Object.keys(dag.Nodes);
  // if (dagKeys.length < backupKeys.length){
  for (var k = 0; k < dagKeys.length; k++){
    // dag.removeNode(k);
  }
  for (var k = 0; k < backupKeys.length; k++){
    dag.setNode(mydagrepo[backupKeys[k]]);
  }
};

mydagrepo.initialDag = null;

// Dagre graph
var RepoDAGDisplay = React.createClass({
  mixins: [Router.Navigation],

  getInitialState() {
    return {
      isAdmin: !!this.context.router.getCurrentQuery().admin
    }
  },

  componentWillReceiveProps: function (nextProps) {
    if (this.state.isAdmin !== !!this.context.router.getCurrentQuery().admin) {
      this.setState({
        isAdmin: !this.state.isAdmin,
        listDataFromChild: null
      })
    }
  },

  componentDidMount: function () {
    this.drawGraph(this.props);
    $(ReactDOM.findDOMNode(this)).tooltip({
      selector: '[data-toggle="tooltip"]'
    });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    const repo_updated = stringify(nextProps.repo.DAG) !== stringify(this.props.repo.DAG);

    if (nextProps.uuid !== this.props.uuid || repo_updated || this.state.isAdmin !== nextState.isAdmin) {
      return true;
    }

    return false;
  },

  isEditable() {
    const serverInfo = this.props.serverInfo;
    //for the full app, check if admin mode is enabled
    //for the lite app, check if the serverInfo mode is set to 'read only'
    return this.state.isAdmin ||
        (this.props.lite && (serverInfo && serverInfo.Mode ? serverInfo.Mode !== 'read only' : true));
  },

  componentDidUpdate: function (props) {
    this.drawGraph(this.props);
  },

  componentWillUnmount() {
    var tips = $(ReactDOM.findDOMNode(this)).find('[data-toggle="tooltip"]');
    tips.tooltip('destroy');
  },

  drawGraph: function (props) {
    if (props.repo.DAG.Nodes.hasOwnProperty(props.uuid)) {
      this.initDag(this, props);
    }
  },

  initialDag: null,

  getNodeById: function(nodeVersionID, dag){
    var keys = Object.keys(dag.Nodes);
    for (var k = 0; k < keys.length; k++){
      var node = dag.Nodes[keys[k]];
      if (node.VersionID == nodeVersionID){
        return node;
      }
    }
    return node;
  },

  // myCallback: function (selectedNode) {
  //   this.clear();
  //
  //   // create new graph
  //   var partialDag = new dagreD3.graphlib.Graph({
  //     compound: true,
  //     multigraph: true
  //   })
  //   .setGraph({})
  //   .setDefaultEdgeLabel(function () {
  //     return {};
  //   });
  //
  //   // add partial nodes to new graph -- first the root node
  //   var version = selectedNode.VersionID;
  //   var name = selectedNode.UUID;
  //   var nodeclass = "";
  //   var log = "";
  //   var note = 'test note';
  //
  //   var rootNode = {
  //     label: version + ': ' + name.substr(0, 5),
  //     css: nodeclass,
  //     rx: 5,
  //     ry: 5,
  //     log: log,
  //     note: note,
  //     fullname: version + ': ' + name,
  //     uuid: name,
  //     id: "node" + version,
  //     expandedChildren: null,
  //     collapsedChildren: null,
  //     isMerge: false,
  //     isCollapsible: false
  //   };
  //   partialDAG.setNode(version, rootNode);
  //
  //   // Get all the predecessors of a node
  //   var preds = mydagrepo.findAllPredecessors(version);
  //
  //   for (var p = 0; p < preds.length; p++){
  //     var version = preds[p];
  //     var oldNode = this.getNodeById(preds[p],this.props.repo.DAG);
  //     var name = oldNode.UUID;
  //     var nodeclass = "";
  //     var log = "";
  //     var note = 'test note';
  //
  //     var newNode = {
  //       label: version + ': ' + name.substr(0, 5),
  //       css: nodeclass,
  //       rx: 5,
  //       ry: 5,
  //       log: log,
  //       note: note,
  //       fullname: version + ': ' + name,
  //       uuid: name,
  //       id: "node" + version,
  //       expandedChildren: null,
  //       collapsedChildren: null,
  //       isMerge: false,
  //       isCollapsible: false
  //     };
  //     partialDAG.setNode(version, newNode);
  //   }
  //
  //   // finally, draw the graph
  //   this.drawTrunk(partialDAG);
  //   this.drawSubtree(partialDAG,rootNode.label.substr(0,1));
  //   this.update(partialDAG);
  //   this.fitDAG(partialDAG);
  // },

  myCallbackBranches: function (selectedBranch) {
    this.clear();

    if (selectedBranch == 'Show all'){
      this.update(dag);
      this.fitDAG(dag);
      return;
    }
    else {
      // create new graph
      var partialDAG = new dagreD3.graphlib.Graph({
        compound: true,
        multigraph: true
      }).setGraph({})
          .setDefaultEdgeLabel(
              function () {
                return {};
              }
          );
      var tNodes = this.props.repo.DAG.Nodes;
      var branchNodes = [];
      var branchKeys = [];
      var branchVersionIds = [];
      var branchChildren = [];
      var otherBranches = [];

      // collect the branch nodes
      var keys = Object.keys(tNodes);
      for (var k=0; k < keys.length; k++){
          if ((tNodes[keys[k]]).Branch == selectedBranch){
              branchNodes.push(tNodes[keys[k]]);
              branchKeys.push(keys[k]);
          }
      }

      // add branch nodes and edges to the partial DAG
      if (branchNodes.length > 0){
        for (var b = 0; b < branchNodes.length; b++){
          var tmpNode = branchNodes[b];
          branchVersionIds.push(tmpNode.VersionID);
          // // check, if parent node is root node, if so, add root
          // if ((this.getNodeByVersion(tmpNode.Parents[0])).Branch !== selectedBranch){
          //   // we found root of the branch -> add it to the tree
          //   partialDAG.setNode(tmpNode.Parents[0], dag._nodes[tmpNode.Parents[0]]);
          // }
          partialDAG.setNode(tmpNode.VersionID, dag._nodes[tmpNode.VersionID]);

          var tChildren = tmpNode.Children;
          for (var i=0; i < tChildren.length; i++){
            var parentChild = {};
            parentChild.parent = tmpNode.VersionID;
            parentChild.child = tChildren[i];
            branchChildren.push(parentChild);
          }

          // Make sure, we are not drawing the edge to the root node (which is of different branch)
          if (this.getNodeByVersion(tmpNode.Parents[0]).Branch === selectedBranch){
            partialDAG.setEdge(tmpNode.Parents[0], tmpNode.VersionID,
                {
                  lineInterpolate: 'basis',
                  arrowheadStyle: "fill: #111",
                  id: tmpNode.Parents[0] + "-" + tmpNode.VersionID
                }
            );
          }
          else {
            // root node belongs to another branch -> show which branch

          }
        }
      }

      // draw the edged to branches which are not displayed
      for (var c = 0; c < branchChildren.length; c++){
        if (branchVersionIds.indexOf(branchChildren[c]) == -1){
            //found a child, which is not part of the branch
            otherBranches.push(branchChildren[c].child);
        }
      }

      // draw some lines to indicate, that there are other branches in the tree
      if (otherBranches.length > 0){
        var tmp = otherBranches[0];

        // draw a line to other branches at other branches
        // draw a line to other branches at other branches
        var myElem = d3.select('#node' + tmp.parent);
        myElem..append("line").attr("x1", 5).attr("y1", 5).attr("x2", 50).attr("y2", 50);
      }

      this.update(partialDAG);
      this.fitDAG(partialDAG);
      }
  },

  // get the actual node with all information from the original DAG
  getNodeByVersion: function(id){
    var nodes = this.props.repo.DAG.Nodes;
    var keys = Object.keys(nodes);

    for (var k = 0; k < keys.length; k++){
      if(nodes[keys[k]].VersionID == id){
        return nodes[keys[k]];
      }
    }
    return null;
  },

  // traverse through DAG and collect child nodes
  collectChildren: function(node, partialDAG, dag){
    var children = node.Children;
    for (var c = 0; c < children.length; c++){
      var tmpNode = this.getNodeByVersion(children[c]);
      partialDAG.setEdge(node.VersionID,children[c]);
      partialDAG.setNode(children[c],dag._nodes[tmpNode.VersionID]);
      this.collectChildren(tmpNode, partialDAG, dag);
    }
  },


  // collect all nodes, which belong to a branch
  drawBranch: function(node, partialDAG, dag, selectedBranch){
     var nodes = this.props.repo.DAG.Nodes;
     var keys = Object.keys(nodes);
     for (var i=0; i < keys.length; i++){
       if (nodes[keys[i]].Branch === selectedBranch){
         var tmpNode = nodes[keys[i]];
         partialDAG.setNode(tmpNode.VersionID, dag._nodes[tmpNode.VersionID]);
         partialDAG.setEdge(tmpNode.Parents[0], tmpNode.VersionID,
             {
               lineInterpolate: 'basis',
               arrowheadStyle: "fill: #111",
               id: tmpNode.Parents[0] + "-" + tmpNode.VersionID
             }
         );
       }
     }
  },

  drawTrunk: function(partialDAG){
    var nodes = partialDAG.nodes();

    // need to go in reverse order so that parent nodes won't be collapsed until all of their children are collapsed
    nodes.forEach(function (n) {
      if (partialDAG.node(n) && partialDAG.node(n).expandedChildren) {
        collapseChildren(n)
      }
    });

    // draw the edges
    var first=null;
    for (var i = 1; i < nodes.length; i++){
      first = nodes[i-1];
      partialDAG.setEdge(first,nodes[i]);
    }
  },


  setEdgeSubtree: function(partialDAG, edges,rootId){
    for (var i = 0; i < edges.length; i++){
      if (edges[i].v == rootId){
        partialDAG.setNode(edges[i].w, this.initialDag._nodes[edges[i].w]);
        partialDAG.setEdge(edges[i].v, edges[i].w);
        this.setEdgeSubtree(partialDAG, edges,edges[i].w);
      }
    }
  },

  drawSubtree: function(partialDAG,rootId){
    var edges = this.initialDag.edges();
    this.setEdgeSubtree(partialDAG,edges,rootId);
  },

  initDag: function (t, props) {
    //initialize svg for D3
    var svg = d3.select("svg");
    // .attr("width", width)
    // .attr("height", height);
    // clear out the existing data.
    svg.selectAll("*").remove();
    //adds background to differentiate from graph elements
    svgBackground = svg.append("rect")
        .attr("id", "svgBackground")
        .attr("fill", "transparent")
        .attr("width", $("svg").width())
        .attr("height", $("svg").height());
    //creates a group that will hold all the svg elements for the graph
    elementHolderLayer = svg.append("g")
        .attr("id", "elementHolderLayer");
    //defines a shadow for the entire svg for use when hovering over nodes
    var shadow = svg.append("defs")
        .append("filter")
        .attr("id", "drop-shadow")
        .attr('x', "-40%")
        .attr('y', "-40%")
        .attr('height', "200%")
        .attr('width', "200%");
    shadow.append("feOffset")
        .attr('result', "offOut")
        .attr('in', "SourceAlpha")
        .attr('dx', "0")
        .attr('dy', "0");
    shadow.append("feGaussianBlur")
        .attr('result', "blurOut")
        .attr('in', "offOut")
        .attr('stdDeviation', "8");
    shadow.append("feBlend")
        .attr('in', "SourceGraphic")
        .attr('in2', "blurOut")
        .attr('mode', "normal");

    // creates new dagreD3 object
    dag = new dagreD3.graphlib.Graph({
      compound: true,
      multigraph: true
    })
      .setGraph({})
      .setDefaultEdgeLabel(function () {
        return {};
      });

    // adds nodes and edges from the JSON dag data
    $.each(props.repo.DAG.Nodes, function (name, n) {
      var version = n.VersionID;
      var log = '';
      if (n.Log.length) log = (n.Log);
      var nodeclass = "";
      if (n.Locked) {
        nodeclass = "type-locked";
      } else {
        nodeclass = "type-unlocked";
      }

      // Note defines the tooltip
      var note = null;
      if (n.Note){
        note = n.Note;
      }

      if (props.repoMasterUuuid && RegExp('^' + props.repoMasterUuuid).test(n.UUID)) {
        nodeclass = nodeclass + " " + "master";
      }
      else if (props.repoMasterBranchHist) {
        props.repoMasterBranchHist.slice(1).forEach(function (masterBranchUuid) {
          if (RegExp('^' + masterBranchUuid).test(n.UUID)) {
            nodeclass += " master_branch";
          }
        }.bind(this))
      }

      if (n.UUID === props.uuid) {
        nodeclass = nodeclass + " current ";
      }

      dag.setNode(version, {
        label: version + ': ' + name.substr(0, 5),
        css: nodeclass,
        rx: 5,
        ry: 5,
        log: log,
        note: note,
        fullname: version + ': ' + name,
        uuid: name,
        id: "node" + version,
        expandedChildren: null,
        collapsedChildren: null,
        isMerge: false,
        isCollapsible: false
      });

      // draw the edges
      $.each(n.Children, function (c) {
          dag.setEdge(version, n.Children[c], {
            lineInterpolate: 'basis',
            arrowheadStyle: "fill: #111",
            id: version + "-" + n.Children[c]
          });
      });
    });

    // sets merges and all their predecessors to be uncollapsible
    // gives merges a "merge" class
    dag.nodes().forEach(function (n) {
      if (dag.predecessors(n).length > 1) {
        dag.node(n).isMerge = true;
        dag.node(n).class = dag.node(n).class + " " + "merge";
        dag.node(n).isCollapsible = false;
        mydagrepo.findAllPredecessors(n).forEach(function (p) {
          dag.node(p).isCollapsible = false;
        });
      }
    });

    // gives parents a variable to access their collapsible children  --- start, no render yet
    dag.nodes().forEach(function (n) {
      //collapsibleChildren will be a dictionary with key being the node name (that you can call dag.node() with) and the value being properties of that node
      var collapsibleChildren = {};
      dag.successors(n).forEach(function (c) {
        if (dag.node(c).isCollapsible) {
          //adds the node properties to collapsibleChildren so that it can be used to add the node back later
          collapsibleChildren[c] = dag.node(c);
        }
      });
      // only give it expandedChildren if it has collapsible children. otherwise it is kept null (and not set to {})
      if (Object.getOwnPropertyNames(collapsibleChildren).length !== 0) {
        dag.node(n).expandedChildren = collapsibleChildren;
        dag.node(n).class = dag.node(n).class + " " + "expanded";
      }
    });

    // kludge for fixing edge crossings created by the initial dagre render:
    // collapse, then expand
    this.collapseGraph();  // collapse graph is rendering the graph
    this.scrollToCurrent();

    //set transition for future collapsing and expanding -- stop, here render took place
    dag.graph().transition = function (selection) {
      return selection.transition().duration(300);
    };

    this.fitDAG();
  },

  clear: function(){
    var svg = d3.select("svg > g");
    svg.selectAll("*").remove();
  },

  update: function (currentDag) {
    var admin = this.context.router.getCurrentQuery().admin;
    var self = this;
    //renders the dag
    var dagreRenderer = new dagreD3.render();
    // Add a custom arrow
    dagreRenderer.arrows().normal = function normal(parent, id, edge, type) {
      var marker = parent.append("marker")
          .attr("id", id)
          .attr("viewBox", "-1 2 12 10")
          .attr("refX", 11)
          .attr("refY", 5)
          .attr("markerWidth", 8)
          .attr("markerHeight", 14)
          .attr("markerUnits", "strokeWidth")
          .attr("orient", "auto");

      var path = marker.append("path")
          .attr("d", "M 0 0 L 10 5 L 0 10")
          .style("stroke-width", 1.5)
          .style("stroke", "black")
          .style("stroke-linejoin", "round");
      dagreD3.util.applyStyle(path, edge[type + "Style"]);
    };

    dagreRenderer(elementHolderLayer, currentDag);

    d3.select(".dag_note").remove();

    let forbidden_toggle = "";
    if (!this.isEditable()) {
      forbidden_toggle = " forbidden"
    }

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "dag_note")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

    // add lock icons
    elementHolderLayer.selectAll("g.node.type-locked")
        .append("svg:foreignObject")
        .attr("width", 20)
        .attr("height", 20)
        .attr("y", "-34px")
        .attr("x", "-35px")
        .append("xhtml:span")
        .attr("class", "lock fa fa-lock");

    if (this.isEditable()) {
      //add branch icons
      elementHolderLayer.selectAll("g.node.type-locked")
          .append("svg:foreignObject")
          .attr("width", 20)
          .attr("height", 20)
          .attr("y", "-34px")
          .attr("x", "-45px")
          .append("xhtml:span")
          .attr("class", "branch fa fa-code-fork");
    }

    // add unlocked icon
    elementHolderLayer.selectAll("g.node.type-unlocked")
        .append("svg:foreignObject")
        .attr("width", 20)
        .attr("height", 20)
        .attr("y", "-34px")
        .attr("x", "-40px")
        .append("xhtml:span")
        .attr("class", `unlocked fa fa-unlock ${forbidden_toggle}`);

    // add navigation listener
    elementHolderLayer.selectAll("g.node rect")
        .on("mouseenter", function (v) {
          if (currentDag.node(v).note) {
            tooltip.style("visibility", "visible");
            tooltip.text(currentDag.node(v).note);
          }
          LogActions.update({log: currentDag.node(v).log, uuid: currentDag.node(v).uuid});
          $('#' + this.id).css("filter", "url(#drop-shadow)");
        })
        .on("mouseleave", function (v) {
          tooltip.style("visibility", "hidden");
          $('#' + this.id).css("filter", "");
        })
        .on("mousemove", function () {
          tooltip.style("top", (d3.event.pageY - 30) + "px").style("left", (d3.event.pageX + 30) + "px")
        })
        .on("click", function (v) {
          // prevents a drag from being registered as a click
          if (d3.event.defaultPrevented) return;
          if (d3.event.shiftKey) {
            self.toggleChildren(v);
          } else {
            //loads the node's data into page (updates viewer link)
            self.navigateDAG(dag.node(v).uuid)
          }
        });

    // add commit and branch actions, if allowed
    if (this.isEditable()) {
      elementHolderLayer.selectAll("g.node foreignObject span")
      //want to add tooltips?
          .on("mouseenter", function (v) {
          })
          .on("mouseleave", function (v) {
          })
          .on("mousemove", function () {
          })
          .on("click", function (v) {
            // prevents a drag from being registered as a click
            if (d3.event.defaultPrevented) return;
            else {
              // loads the node's data into page
              var uuid = currentDag.node(v).uuid;
              var classList = d3.event.path[0].classList;

              // figure out what action to take based on the icon class
              var action = null;
              if (classList.contains("unlocked")) {
                action = ModalActions.openModal.bind({},
                    {
                      MODAL_TYPE: ModalTypes.COMMIT_MODAL,
                      uuid: uuid
                    });
              }
              else if (classList.contains("branch")) {
                action = ModalActions.openModal.bind({},
                    {
                      MODAL_TYPE: ModalTypes.BRANCH_MODAL,
                      uuid: uuid
                    });
              }

              // determine if a navigation is also needed
              if (self.uuid !== uuid) {
                // it's not the current node--navigate to the node
                self.navigateDAG(uuid, action)
              }
              else if (action) {
                action();
              }
            }
          });
    }

    var nodeDrag = d3.behavior.drag()
        .on("drag", function (d) {
          var node = d3.select(this),
              selectedNode = currentDag.node(d);
          var prevX = selectedNode.x,
              prevY = selectedNode.y;

          selectedNode.x += d3.event.dx;
          selectedNode.y += d3.event.dy;

          node.attr('transform', 'translate(' + selectedNode.x + ',' + selectedNode.y + ')');

          var dx = selectedNode.x - prevX,
              dy = selectedNode.y - prevY;

          $.each(currentDag.nodeEdges(d), function (i, e) {
            translateEdge(currentDag.edge(e.v, e.w), dx, dy);
            $('#' + currentDag.edge(e.v, e.w).id + " .path").attr('d', calcPoints(e,currentDag));
          });
        });

    var edgeDrag = d3.behavior.drag()
        .on('drag', function (d) {
          translateEdge(currentDag.edge(d.v, d.w), d3.event.dx, d3.event.dy);
          $('#' + currentDag.edge(d.v, d.w).id + " .path").attr('d', calcPoints(d));
        });
    //add lock icons
    nodeDrag.call(elementHolderLayer.selectAll("g.node"));
    edgeDrag.call(elementHolderLayer.selectAll("g.edgePath"));
  },

  navigateDAG: function (uuid, callback) {
    if (uuid !== this.props.uuid) {
      if (this.props.lite) {
        InstanceActions.clearMeta();
        ServerActions.fetch({uuid: uuid});
      }
      else {
        let queryparams = null;
        if (this.context.router.getCurrentQuery().admin !== undefined) {
          queryparams = {
            admin: this.context.router.getCurrentQuery().admin
          };
        }

        this.transitionTo('repo', {
              uuid: uuid,
            },
            queryparams
        );
      }
    }
    if (callback) {
      setTimeout(function () {
        callback();
      }, 0)
    }
  },

  scrollToCurrent: function () {
    ErrorActions.clear.defer();
    this.expandGraph();

    var success = this.scrollToNode(".node.current");
    if (!success) {
      ErrorActions.update('Can\'t find current node');
    }
  },

  scrollToMaster: function () {
    ErrorActions.clear();
    this.expandGraph();
    var success = this.scrollToNode(".node.master");
    if (!success) {
      this.fitDAG();
      ErrorActions.update('Repo does not have a master node');
    }
  },

  scrollToNode: function (nodeSelector) {
    // figure out the scale ratio that will be used to resize the graph.
    var node = elementHolderLayer.select(nodeSelector);
    if (!node.empty()) {
      //get the current transform applied to the node
      var mTransform = d3.transform(node.attr('transform'));
      var masterT = {x: mTransform.translate[0], y: mTransform.translate[1]};
      //create a translation that will center this node on the display
      var newT = {
        x: $("svg").width() / 2 - masterT.x,
        y: $("svg").height() / 2 - masterT.y,
      }
      // apply with a basic transition
      elementHolderLayer.transition().duration(300).attr("transform", "translate(" + newT.x + ", " + newT.y + ")");
      // pass scale=1, since we're using the initial element size
      this.setZoom([newT.x, newT.y], 1);
      return true;
    }
    else {
      return false;
    }
  },

  autocompleteCallback: function (dataFromAutoComplete) {
    this.setState({listDataFromChild: dataFromChild});
  },

  setZoom: function (center, scale) {
    var zoom = d3.behavior.zoom()
        .on("zoom", function () {
          elementHolderLayer.attr("transform", "translate(" + d3.event.translate + ")" +
              "scale(" + d3.event.scale + ")");
        })
        //prevents graph from being zoomed in super close or smaller than the container
        .scaleExtent([0, 1.5]);
    svgBackground.call(zoom);
    // //scale and translate zoom so that it lines up with the graph
    zoom.scale(scale);
    zoom.translate(center);
  },

  fitDAG: function () {
    // figure out the scale ratio that will be used to resize the graph.
    var scale = Math.min($("svg").width() / dag.graph().width, $("svg").height() / dag.graph().height);
    //only scale the graph if it's larger than the container. otherwise, keep original size
    scale = scale > 1 ? 1 : scale -= 0.05;
    // work out the offsets needed to center the graph
    var xCenterOffset = Math.abs(((dag.graph().width * scale) - $("svg").width()) / 2);
    var yCenterOffset = Math.abs(((dag.graph().height * scale) - $("svg").height()) / 2);
    //nudge the y down a bit
    yCenterOffset += 5;
    // apply the scale and translation in one go.
    elementHolderLayer.attr("transform", "matrix(" + scale + ", 0, 0, " + scale + ", " + xCenterOffset + "," + yCenterOffset + ")");
    // Set up zoom support
    this.setZoom([xCenterOffset, yCenterOffset], scale)

  },

  // toggles collapsing and expanding of a parent node
  toggleChildren: function (parent) {
    if (dag.node(parent) && dag.node(parent).expandedChildren) {
      collapseChildren(parent)
    } else if (dag.node(parent).collapsedChildren) {
      expandChildren(parent)
    }
    this.update(dag);
    this.scrollToNode('#node' + parent)
  },

  // fully expands entire DAG
  expandGraph: function (someExpanded = false) {
    //skip expansion if no nodes are hidden

    //keep track of number of nodes expanded so that recursion can be terminated
    var nodesExpanded = 0;
    dag.nodes().forEach(function (n) {
      if (dag.node(n).collapsedChildren) {
        nodesExpanded += 1;
        expandChildren(n);
      }
    });
    someExpanded = someExpanded || nodesExpanded > 0;
    if (nodesExpanded) {
      this.expandGraph(someExpanded);
    } else {
      //if no nodes were expanded, it means the graph has been completely expanded.
      //clean up old graph elements before redraw
      if (someExpanded) {//no need to redraw if no nodes were ever expanded
        var svg = d3.select("svg > g");
        svg.selectAll("*").remove();
        this.update(dag);
      }
    }
  },

  // fully collapses entire DAG
  collapseGraph: function () {
    // need to go in reverse order so that parent nodes won't be collapsed until all of their children are collapsed
    dag.nodes().reverse().forEach(function (n) {
      if (dag.node(n) && dag.node(n).expandedChildren) {
        collapseChildren(n)
      }
    });
    this.update(dag);
  },

  expandAndScale: function () {
    ErrorActions.clear()
    this.expandGraph();
    this.fitDAG();
  },

  collapseAndScale: function () {
    ErrorActions.clear()
    this.collapseGraph();
    this.fitDAG();
  },

  downloadSVGHandler: function (event) {
    this.fitDAG();
    var e = document.createElement('script');
    e.setAttribute('src', "/js/vendor/svg-crowbar.js");
    e.setAttribute('class', 'svg-crowbar');
    document.body.appendChild(e);
  },

  render: function () {
    var scrollToMasterBtn = '';

    if (this.props.repoMasterUuuid) {
      scrollToMasterBtn =
          <button className="btn btn-default master pull-right" data-container="body" data-toggle="tooltip"
                  data-placement="bottom"
                  title="scroll to master node" onClick={this.scrollToMaster}><span className="fa fa-crosshairs"></span>
          </button>
    }

    var headline = <h4>Version History</h4>;
    var options = ['one', 'two', 'three'];

    var dagHeight = "500";
    var value = '';

    if (this.props.lite === "1") {
      dagHeight = "400";
      headline = <div id='dag-header'><h5>Version History</h5></div>;
    }
    return (
        <div>
          {headline}
          <div className="dag">
            <div>
              <div className="dag-dropdown no-border">
                {/*<VersionDropdown myNodes={this.props.repo.DAG.Nodes} callbackFromParent={this.myCallback}/>*/}
                <BranchDropdown myNodes={this.props.repo.DAG.Nodes} callbackFromParent={this.myCallbackBranches} />
              </div>
              <div className='dag-tools'>
                <button className="btn btn-default pull-right" data-container="body" data-toggle="tooltip"
                        data-placement="bottom"
                        title="help" onClick={ModalActions.openModal.bind({},
                    {
                      MODAL_TYPE: ModalTypes.DAGINFO_MODAL,
                      uuid: null,
                      isEditable: this.isEditable()
                    })}><span className="fa fa-question"></span></button>
                <button className="btn btn-default pull-right" data-container="body" data-toggle="tooltip"
                        data-placement="bottom"
                        title="fit graph to window" onClick={this.fitDAG}>
                  <span className="fa fa-arrows-alt"></span>
                </button>
                <button className="btn btn-default current pull-right" data-container="body" data-toggle="tooltip"
                        data-placement="bottom"
                        title="scroll to current node" onClick={this.scrollToCurrent}><span
                    className="fa fa-crosshairs"></span></button>
                {scrollToMasterBtn}
                <button className="btn btn-default pull-right" data-container="body" data-toggle="tooltip"
                        data-placement="bottom"
                        title="download version history as svg" onClick={this.downloadSVGHandler}><span
                    className="fa fa-download"></span></button>
              </div>
              <svg width="100%" height={dagHeight} ref="DAGimage">
                <g/>
              </svg>
            </div>
          </div>
          <DAGmodals/>
        </div>
    );
  }
})
;


class RepoDAG extends React.Component {
  render() {
    return (
        <AltContainer store={ServerStore}>
          <RepoDAGDisplay uuid={this.props.uuid} lite={this.props.lite}/>
        </AltContainer>
    );
  }
};


module.exports = RepoDAG;

function translateEdge(e, dx, dy) {
  e.points.forEach(function (p) {
    p.x = p.x + dx;
    p.y = p.y + dy;
  });
}

// taken from dagre-d3 source code (not the exact same)
function calcPoints(e, currentDag) {
  var edge = currentDag.edge(e.v, e.w),
      tail = currentDag.node(e.v),
      head = currentDag.node(e.w);
  var points = edge.points.slice(1, edge.points.length - 1);
  var afterslice = edge.points.slice(1, edge.points.length - 1);
  points.unshift(intersectRect(tail, points[0]));
  points.push(intersectRect(head, points[points.length - 1]));
  return d3.svg.line()
      .x(function (d) {
        return d.x;
      })
      .y(function (d) {
        return d.y;
      })
      .interpolate("basis")
      (points);
}

// taken from dagre-d3 source code (not the exact same)
function intersectRect(node, point) {
  var x = node.x;
  var y = node.y;
  var dx = point.x - x;
  var dy = point.y - y;
  var w = $("#" + node.id + " rect").attr('width') / 2;
  var h = $("#" + node.id + " rect").attr('height') / 2;
  var sx = 0,
      sy = 0;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    // Intersection is top or bottom of rect.
    if (dy < 0) {
      h = -h;
    }
    sx = dy === 0 ? 0 : h * dx / dy;
    sy = h;
  } else {
    // Intersection is left or right of rect.
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = dx === 0 ? 0 : w * dy / dx;
  }
  return {
    x: x + sx,
    y: y + sy
  };
}

function collapseChildren(parent) {
  dag.node(parent).class = dag.node(parent).class.replace("expanded", '');
  dag.node(parent).class = dag.node(parent).class + " " + "collapsed";
  collapse(dag.node(parent).expandedChildren);
  dag.node(parent).collapsedChildren = dag.node(parent).expandedChildren;
  dag.node(parent).expandedChildren = null;
}

function expandChildren(parent) {
  dag.node(parent).class = dag.node(parent).class.replace("collapsed", '');
  dag.node(parent).class = dag.node(parent).class + " " + "expanded";
  expand(parent, dag.node(parent).collapsedChildren);
  dag.node(parent).expandedChildren = dag.node(parent).collapsedChildren;
  dag.node(parent).collapsedChildren = null;
}

// recursively collapses subgraph of parent
function collapse(expandedChildren) {
  for (var child in expandedChildren) {
    dag.removeNode(child);
    collapse(expandedChildren[child].expandedChildren);
  }
}

// recursively expands subgraph of parent
function expand(parent, collapsedChildren) {
  for (var child in collapsedChildren) {
    dag.setNode(child, collapsedChildren[child]);
    dag.setEdge(parent, child, {
      lineInterpolate: 'basis',
      id: parent + "-" + child,
      arrowheadStyle: "fill: #111",
    });
    //NOT a typo! only the parent's immediate collapsed children are expanded.
    //the parent's children's expanded children (not collapsed children) are expanded for the rest of the graph.
    expand(child, collapsedChildren[child].expandedChildren);
  }
}


