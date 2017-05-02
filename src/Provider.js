import React from 'react';
import PropTypes from 'prop-types';

import storeShape from './storeShape';

export default class Provider extends React.PureComponent {

  static propTypes = {
    store: storeShape.isRequired
  };

  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return {
      store: this.props.store
    };
  }

  render() {
    return this.props.children;
  }

}
