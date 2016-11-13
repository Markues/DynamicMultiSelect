import alt from '../alt';

class DynamicSelectActions {
  constructor() {
    this.generateActions(
      'getSelectItemsSuccess',
      'getSelectItemsFail',
      'updateCheck',
      'updateCollapse'
    );
  }

  getSelectItems(transformFunc) {
    $.ajax({url: '/api/select/fetch'})
      .done((data) => {
        this.actions.getSelectItemsSuccess({data: data, transformFunc: transformFunc})
      })
      .fail((jqXhr) => {
        this.actions.getSelectItemsFail(jqXhr)
      });
  }

  handleCheck(action, updateQueryString, currState, node) {
    // Send over just the node that was toggled
    this.actions.updateCheck({node: node[node.length - 1], updateQueryString: updateQueryString, currState: currState});
  }

  handleCollapse(action, currState, node) {
    // Send over just the node that was toggled
    this.actions.updateCollapse({node: node[node.length - 1], currState: currState});
  }
}

export default alt.createActions(DynamicSelectActions);
