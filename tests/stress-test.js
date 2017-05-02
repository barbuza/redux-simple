import test  from './base';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { createStore } from 'redux'

import { Provider, connect } from '../src';

function items(state = { loading: false }, action) {
  switch (action.type) {
  case 'START':
    return { loading: true };
  case 'STOP':
    return { loading: false };
  default:
    return state;
  }
}

@connect(state => state)
class Indicator extends React.PureComponent {

  render() {
    const { loading } = this.props;
    return (
      <div>{loading ? 1 : 0}</div>
    );
  }

}

test('stress', t => {
  const store = createStore(items);

  const res = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <Indicator />
    </Provider>
  );

  t.plan(1);

  const timeouts = [];

  for (let i = 0; i < 1000; i++) {
    timeouts.push(i);
  }

  timeouts.forEach(timeout => {
    setTimeout(() => {
      store.dispatch({
        type: (timeout % 2) ? 'STOP' : 'START'
      });
    }, timeout);
  });

  setTimeout(() => {
    const resNode = ReactDOM.findDOMNode(res);
    t.equal(resNode.textContent, '0');
  }, 1100);

});
