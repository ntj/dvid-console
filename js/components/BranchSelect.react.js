import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import Select from 'react-select';

var StatesField = createClass({
	displayName: 'StatesField',
	propTypes: {
		label: PropTypes.string,
		searchable: PropTypes.bool,
	},
	getDefaultProps () {
		return {
			label: 'States:',
			searchable: true,
		};
	},
	getInitialState () {
		return {
			country: 'AU',
			disabled: false,
			searchable: this.props.searchable,
			selectValue: 'new-south-wales',
			clearable: true,
			rtl: false,
		};
	},
	switchCountry (e) {
		var newCountry = e.target.value;
		this.setState({
			country: newCountry,
			selectValue: null,
		});
	},
	updateValue (newValue) {
		this.setState({
			selectValue: newValue,
		});
	},
	focusStateSelect () {
		this.refs.stateSelect.focus();
	},
	toggleCheckbox (e) {
		let newState = {};
		newState[e.target.name] = e.target.checked;
		this.setState(newState);
	},

	getCompleteData() {
      var values = this.props.myNodes;
      var keys = Object.keys(values);
      // var result = 'Show all'];
      var result = [{value: 'showall', label: 'Show All', className: ''}];
      for (var i = 0; i < keys.length; i++) {
        var tBranch = values[keys[i]].Branch;
        if (tBranch == ''){
          tBranch = 'master';
        }
        // if (Object.keys(result).indexOf(tBranch) === -1) { // result does have the branch name already -> add another node to the list of branch nodes
        //   result.push({value: tBranch, label: tBranch, className: ''});
        // }
        result.push({value: tBranch, label: tBranch, className: ''});
      }
      return result;
  	},

	render () {
		var options = this.getCompleteData();
		console.log(options);
		return (
			<div className="section">
				<Select
					id="state-select"
					ref="stateSelect"
					autoFocus
					options={options}
					simpleValue
					clearable={this.state.clearable}
					name="selected-state"
					disabled={this.state.disabled}
					value={this.state.selectValue}
					onChange={this.updateValue}
					rtl={this.state.rtl}
					searchable={this.state.searchable}
				/>
			</div>
		);
	}
});

module.exports = StatesField;
