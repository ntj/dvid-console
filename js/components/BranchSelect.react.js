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
		this.props.callbackFromParent(newValue);
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
	
      	 var nodes = this.props.myNodes;
	// get distinct branch names
         var keySet = Object.keys(nodes).reduce(
		function(set, key) {
			if (nodes[key].Branch == ""){
			  set.add('master');
			}
			else {
			  set.add(nodes[key].Branch)
			}
			return set;
		},
		new Set());
        // create object for each branch
	 var result = Array.from(keySet).map(function(key){
		return { value: key, label: key, className: ''};
		})
	 // Prepend showall
         result.unshift({value: 'showall', label: 'Show All', className: ''});
         return result;
  	},

	render () {
		var options = this.getCompleteData();
		return (
			<div className="section">
				<Select
					id="branch-select"
					ref="branchSelect"
					autoFocus
					options={options}
					simpleValue
					clearable={this.state.clearable}
					name="selected-branch"
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
