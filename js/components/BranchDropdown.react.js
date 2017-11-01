import React from 'react';

// Import the Autocomplete Component
import Autocomplete from 'react-autocomplete';

export default class BranchDropdown extends React.Component {

  constructor(props, context) {
    super(props, context);

    // Set initial State
    this.state = {
      // Current value of the select field
      currentBranch: this.getFirstBranch(),
      autocompleteData: this.getCompleteData()
    };

    // Bind `this` context to functions of the class
    this.onChange = this.onChange.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.getItemValue = this.getItemValue.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  /**
   * Callback triggered when the user types in the autocomplete field
   *
   * @param {Event} e JavaScript Event
   * @return {Event} Event of JavaScript can be used as usual.
   */
  onChange(e) {
    this.setState({
      currentBranch: e.target.value !== "" e.target.value: 'master'
    });
  }

  /**
   * Callback triggered when the autocomplete input changes.
   *
   * @param {Object} val Value returned by the getItemValue function.
   * @return {Nothing} No value is returned
   */
  onSelect(val){
    this.setState({
      currentBranch: 'honey',
    });

    this.props.callbackFromParent(val);
  }


  getFirstBranch() {
    return "Show all";
  }

  getCompleteData() {
    console.log('Antje makes changes');
    var values = this.props.myNodes;
    var keys = Object.keys(values);
    var result = ['Show all'];
    for (var i = 0; i < keys.length; i++) {
      var tBranch = values[keys[i]].Branch;
      // rename empty branch to master
      if (tBranch == ''){
          tBranch = 'master';
        }
      if (result.indexOf(tBranch) === -1) { // result does have the branch name already -> add another node to the list of branch nodes
        result.push(tBranch);
      }
    }
    console.log(result);
    return result;
  }

  /**
   * Define the markup of every rendered item of the autocomplete.
   *vim
   * @param {Object} item Single object from the data that can be shown inside the autocomplete
   * @param {Boolean} isHighlighted declares whether the item has been highlighted or not.
   * @return {Markup} Component
   */
  renderItem(item, isHighlighted){
    return (
        <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
          {item}
        </div>
    );
  }

  /**
   * Define which property of the autocomplete source will be show to the user.
   *
   * @param {Object} item Single object from the data that can be shown inside the autocomplete
   * @return {String} val
   */
  getItemValue(item){
    return `${item}`;
  }

  render() {
    return (
        <div className="no-border">
          <Autocomplete
              getItemValue={this.getItemValue}
              items={this.state.autocompleteData}
              renderItem={this.renderItem}
              value={this.state.currentBranch}
              onChange={this.onChange}
              onSelect={this.onSelect}
          />
        </div>
    );
  }
}