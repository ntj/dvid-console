import React from 'react';

// Import the Autocomplete Component
import Autocomplete from 'react-autocomplete';

/**
 * Found here
 * https://ourcodeworld.com/articles/read/546/how-to-create-a-synchronous-and-asynchronous-autocomplete-input-in-reactjs
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
      value: val
    });
  }

  /**
   * Define the markup of every rendered item of the autocomplete.
   *
   * @param {Object} item Single object from the data that can be shown inside the autocomplete
   * @param {Boolean} isHighlighted declares wheter the item has been highlighted or not.
   * @return {Markup} Component
   */
  renderItem(item, isHighlighted){
    return (
        <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
          {item.label} : {item.value}
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
    return `${item.label} : ${item.value}`;
  }

  /**
   * Compute stuff
   */
  getDataVersions(){
    var result = [];
    // var keys = Object.keys(this.props.repo.DAG.Nodes);
    var values = this.props.myNodes;

    var keys = Object.keys(values);
    for (var i = 0; i < keys.length; i++){
      result.push({
          label: values[keys[i]].VersionID,
          value: values[keys[i]].UUID.substr(0,5)
        }
      );
    }
    return result;
  }

  render() {
    return (
        <div>
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