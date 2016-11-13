import React from 'react';
import DynamicSelect from './DynamicSelect';

class ParentComponent extends React.Component {
  render() {
    function updateQueryStringParameter(url) {
      return function(key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = url.indexOf('?') !== -1 ? "&" : "?";
        if (url.match(re)) {
          return url.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
          return url + separator + key + "=" + value;
        }
      };
    }

    // Parse query string for 'name' variable
    function getParameterByName(url) {
      return function(name) {
        var adjName = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + adjName + "(=([^&#]*)|&|#|$)");
        var results = regex.exec(url);
        if (!results) {
          return null;
        }
        if (!results[2]) {
          return '';
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
      };
    }

    let fullUrl = this.props.location.pathname + this.props.location.search;
    let updateQueryString = updateQueryStringParameter(fullUrl);
    let getQueryParam = getParameterByName(fullUrl);

    let selectArray = getQueryParam("selectData").replace(/[()]/g, '').split(/[/|.]/); // Split on '.' and '|'

    return (
      <div className='container'>
        <div className='jumbotron'>
          <form role='form'>
            <DynamicSelect selectArray={selectArray} updateQueryString={updateQueryString}/>
          </form>
        </div>
      </div>
    );
  }
}

export default ParentComponent;
