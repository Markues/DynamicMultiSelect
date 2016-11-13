import alt from '../alt';
import DynamicSelectActions from '../actions/DynamicSelectActions';
import {browserHistory} from 'react-router';
import {_} from 'underscore';

class DynamicSelectStore {
  constructor() {
    this.bindActions(DynamicSelectActions);
    this.selectItems = [{value: 'loading...', label: 'Loading...'}];
  }

  onGetSelectItemsSuccess(blob) {
    this.selectItems = blob.transformFunc(blob.data);
  }

  onGetSelectItemsFail(jqXhr) {
    console.error(jqXhr.responseJSON && jqXhr.responseJSON.message || jqXhr.responseText || jqXhr.statusText);
    alert('Select Data Fetch failed!');
  }

  onUpdateCheck(data) {
    let newSelectItems = _.map(data.currState, (selectItem) => {
      let willBeChecked = selectItem.value === data.node ? !selectItem.checked : selectItem.checked;

      if(selectItem.children !== undefined) { // Does this selectItem have children ?
        // Will there be a checked child?
        let willChildBeChecked = _.find(_.map(selectItem.children, (child) => {
                                  // We only care about the node being checked
                                  if(child.value === data.node) {
                                    return {"checked": (child.value === data.node ? !child.checked : child.checked)};
                                  }
                                  else {
                                    return {"checked": false};
                                  }
                                }), (item) => {return item.checked === true;}) !== undefined;

        let netResult = willChildBeChecked ? false : willBeChecked;

        return {
          "label": selectItem.label,
          "value": selectItem.value,
          "checkbox": true,
          "checked": netResult,
          "collapsed": selectItem.collapsed,
          "children": _.map(selectItem.children, (child) => {
            return {
              "label": child.label,
              "value": child.value,
              "checkbox": true,
              "checked": (netResult ? false : (child.value === data.node ? !child.checked : child.checked))
            };
          })
        };
      } else {
        return {
          "label": selectItem.label,
          "value": selectItem.value,
          "checkbox": true,
          "checked": willBeChecked
        };
      }
    });

    this.selectItems = newSelectItems;

    // Get all the selectItems that are selected (including ones who just have selected children)
    let selectData = _.map(_.filter(newSelectItems, (selectItem) => {
      return selectItem.checked || _.find(selectItem.children, (child) => {
        return child.checked;
      });
    }), (item) => {
      if(item.children !== undefined) {
        return {
          "value": item.value,
          "children": _.pluck(_.filter(item.children, (child) => {
            return child.checked;
          }), "value")
        };
      } else {
        return {
          "value": item.value
        };
      }
    });

    // Make array of the text that is needed for the query string
    let selectDataArray = _.map(selectData, (item) => {
      if(item.children !== undefined) { // Do we have children?
        if (item.children.length < 1) {
          return item.value;
        }
        else if(item.children.length == 1) {
          return item.value + "." + item.children[0];
        }
        else if(item.children.length > 1) {
          return (item.value + ".(" + (_.reduce(item.children, (memo, value) => {
            return memo + value + "|"
          }, "")).slice(0, -1)) + ")";
        }
      } else {
        return item.value;
      }
    });

    let selectDataString = "";
    if (selectDataArray.length < 1) {
      selectDataString = "";
    }
    else if(selectDataArray.length === 1) {
      selectDataString = selectDataArray[0];
    }
    else if(selectDataArray.length > 1) {
      selectDataString = (_.reduce(selectDataArray, (memo, value) => {
        return memo + "(" + value + ")" + "|"
      }, "")).slice(0, -1);
    }

    let newUri = data.updateQueryString("selectData", selectDataString);
    browserHistory.push(newUri);
  }

  onUpdateCollapse(data) {
    let newSelectItems = _.map(data.currState, (selectItem) => {
      if(selectItem.children !== undefined) { // Does this selectItem have children ?
        return {
          "label": selectItem.label,
          "value": selectItem.value,
          "checkbox": true,
          "checked": selectItem.checked,
          "collapsed": (selectItem.value === data.node ? !selectItem.collapsed : selectItem.collapsed),
          "children": selectItem.children
        };
      } else {
        return {
          "label": selectItem.label,
          "value": selectItem.value,
          "checkbox": true,
          "checked": selectItem.checked
        };
      }
    });

    this.selectItems = newSelectItems;
  }
}

export default alt.createStore(DynamicSelectStore);
