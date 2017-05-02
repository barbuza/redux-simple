import test, { wait } from './base';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { createStore } from 'redux'

import { Provider, connect } from '../src';

function counter(state = { count: 0 }, action) {
  switch (action.type) {
  case 'INCREMENT':
    return { ...state, count: state.count + 1 };
  case 'DECREMENT':
    return { ...state, count: state.count - 1 };
  default:
    return state;
  }
}

@connect(state => state)
class Foo extends React.PureComponent {

  render() {
    return <div>{this.props.count}</div>;
  }

}

test('simple', t => {
  const store = createStore(counter);

  const res = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <Foo />
    </Provider>
  );

  const resNode = ReactDOM.findDOMNode(res);

  t.plan(3);

  t.equal(resNode.textContent, '0');

  wait(() => {
    store.dispatch({type: 'INCREMENT'});

    t.equal(resNode.textContent, '0');

    wait(() => {
      t.equal(resNode.textContent, '1');
    });
  });
});

test('reverse', t => {
  const store = createStore(counter);

  const res = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <Foo />
    </Provider>
  );

  const resNode = ReactDOM.findDOMNode(res);

  t.plan(3);

  t.equal(resNode.textContent, '0');

  wait(() => {
    store.dispatch({type: 'INCREMENT'});

    t.equal(resNode.textContent, '0');

    store.dispatch({type: 'DECREMENT'});

    wait(() => {
      t.equal(resNode.textContent, '0');
    });
  });
});
