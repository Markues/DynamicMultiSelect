import React from 'react';
import {TreeMenu, TreeNode} from '../react-tree-menu/index';
import DynamicSelectStore from '../stores/DynamicSelectStore';
import DynamicSelectActions from '../actions/DynamicSelectActions';
import {_} from 'underscore';

class DynamicSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = DynamicSelectStore.getState();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    DynamicSelectStore.listen(this.onChange);

    let transformFunc = this.determineSelection(this.props.selectArray);
    DynamicSelectActions.getSelectItems(transformFunc);
  }

  componentWillReceiveProps(nextProps) {
    let transformFunc = this.determineSelection(nextProps.selectArray);
    this.setState({selectItems: transformFunc(this.state.selectItems)});
  }

  componentWillUnmount() {
    DynamicSelectStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState(state);
  }

  determineSelection(selectArray) {
    return function(selectItems) {
      return _.map(selectItems, (selectItem) => {
        // Does the selectItem have an entry in the selectArray?
        let hasSIVal = _.find(selectArray, (siVal) => {return selectItem.value === siVal;}) !== undefined;

        // Does this selectItem have children ?
        if(selectItem.children !== undefined) {
          // Does the selectItem have a child that needs to be checked ?
          let hasCheckedChild = _.find(_.map(selectItem.children, (child) => {
                                  return {
                                    "checked": (_.find(selectArray, (siVal) => {
                                      return child.value === siVal;
                                    }) !== undefined ? true : false)
                                  };
                                }), (item) => {return item.checked == true;}) !== undefined;
          // Using the above info, will this parent selectItem be checked ?
          let willBeChecked = hasCheckedChild ? false : (hasSIVal ? true : false);

          return {
            "label": selectItem.label,
            "value": selectItem.value,
            "checkbox": true,
            "checked": willBeChecked,
            "collapsed": !hasCheckedChild,
            "children": _.map(selectItem.children, (child) => {
              // Will this child be checked based on above info?
              let childChecked = (_.find(selectArray, (siVal) => {
                  return child.value === siVal;
                }) !== undefined) ? true : false;
              return {
                "label": child.label,
                "value": child.value,
                "checkbox": true,
                "checked": childChecked
              };
            })
          };
        } else {
          return {
            "label": selectItem.label,
            "value": selectItem.value,
            "checkbox": true,
            "checked": hasSIVal
          };
        }
      });
    }
  }

  render() {
    let self = this;

    return (
      <td className='col-xs-3'>
        <TreeMenu
          identifier="value"
          expandIconClass="glyphicon glyphicon-triangle-right"
          collapseIconClass="glyphicon glyphicon-triangle-bottom"
          data={self.state.selectItems}
          onTreeNodeCollapseChange={DynamicSelectActions.handleCollapse.bind(this, "collapse", self.state.selectItems)}
          onTreeNodeCheckChange={DynamicSelectActions.handleCheck.bind(this, "checked",
            self.props.updateQueryString, self.state.selectItems)}/>
      </td>
    );
  }
}

export default DynamicSelect;
