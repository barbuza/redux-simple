import React from 'react';
import PureComponent from 'react-pure-render/component';

import storeShape from './storeShape';

export default class Provider extends PureComponent {

  static propTypes = {
    store: storeShape.isRequired
  };

  static childContextTypes = {
    store: React.PropTypes.object
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
