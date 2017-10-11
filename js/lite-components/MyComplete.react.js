import React from 'react';

// Import the Autocomplete Component
import Autocomplete from 'react-autocomplete';

/**
 * Basic class setup found here:
 * https://ourcodeworld.com/articles/read/546/how-to-create-a-synchronous-and-asynchronous-autocomplete-input-in-reactjs
 *
 * Information about passing state information
 * https://medium.com/@ruthmpardee/passing-data-between-react-components-103ad82ebd17
 */
export default class MyComplete extends React.Component {

  constructor(props, context) {
    super(props, context);

    // Set initial State
    this.state = {
      // Current value of the select field
      value: this.getItemValue(this.getDataVersions()[0]),
      autocompleteData: this.getDataVersions()
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
  onChange(e){
    this.setState({
      value: e.target.value
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
      value: val,

    });

    var myData = this.state.autocompleteData;
    // get the element from autocomplete data which matches val
    var keys = Object.keys(myData);

    for (var i = 0; i < keys.length; i++){
        if (myData[keys[i]].VersionID == val.substr(0,1)){
          this.props.callbackFromParent(myData[keys[i]]);
        }
    }
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
          {item.VersionID} : {item.value}
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
    // You can obviously only return the Label or the component you need to show
    // In this case we are going to show the value and the label that shows in the input
    // something like "1 - Microsoft"
    return `${item.VersionID} : ${item.value}`;
  }

  /**
   * Get the label and the value to fill the dropdown box
   */
  getDataVersions(){
    // var keys = Object.keys(this.props.repo.DAG.Nodes);
    var values = this.props.myNodes;
    var keys = Object.keys(values);
    var result = [];
   for (var i = 0; i < keys.length; i++){
      result.push({
          VersionID: values[keys[i]].VersionID,
          UUID: values[keys[i]].UUID,
          value: values[keys[i]].UUID.substr(0,5),
        }
      );
    }
    result.sort(
        function(a, b) {
          if (a.VersionID < b.VersionID){
            return -1;
          }
          if (a.VersionID > b.VersionID){
            return 1;
          }
          return 0;
        }
    );
    return result.sort();
  }

  render() {
    return (
        <div className="no-border">
          <Autocomplete
              getItemValue={this.getItemValue}
              items={this.state.autocompleteData}
              renderItem={this.renderItem}
              value={this.state.value}
              onChange={this.onChange}
              onSelect={this.onSelect}
          />
        </div>
    );
  }
}
