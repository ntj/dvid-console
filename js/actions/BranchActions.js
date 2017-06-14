import alt from '../alt';

class BranchActions {
  parseDAG(data){
    this.dispatch(data)
  }
  onSelectBranch(data){
    this.dispatch(data)
  }
  onClearBranchData(data){
    this.dispatch(data)
  }
}

module.exports = (alt.createActions(BranchActions));
