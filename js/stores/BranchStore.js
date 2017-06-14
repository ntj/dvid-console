import alt from '../alt';
import BranchActions from '../actions/BranchActions';

class BranchStore {
  constructor() {
    this.bindActions(BranchActions);
    this.branches = null;
    this.selectedBranch = null;
    this.filteredDAG = null;
  }

  onParseDAG(opts){

  }

  onSelectBranch(opts){

  }

  onClearBranchData(opts){

  }


}

module.exports = (alt.createStore(BranchStore, 'BranchStore'));
