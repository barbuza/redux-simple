import test from './base';
import React from 'react';
import PureComponent from 'react-pure-render/component';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import { createStore } from 'redux'
import raf from 'raf';
import asap from 'asap';

import { Provider, connect } from '../src';

function items(state = { items: [ { value: 1} ] }, action) {
  switch (action.type) {
  case 'REMOVE':
    return { ...state, items: state.items.slice(1) };
  default:
    return state;
  }
}

@connect(state => state)
class List extends PureComponent {

  render() {
    return (
      <ul>
        {this.props.items.map((_, index) => <Item key={index} index={index} />)}
      </ul>
    );
  }

}

@connect((state, { index }) => ({ value: state.items[index].value }))
class Item extends PureComponent {

  render() {
    return <li>{this.props.value}</li>;
  }

}

test('reconciliation', t => {
  const store = createStore(items);

  const res = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <List />
    </Provider>
  );

  t.plan(1);

  asap(() => {
    store.dispatch({
      type: 'REMOVE'
    });

    raf(() => {
      t.equal(TestUtils.scryRenderedDOMComponentsWithTag(res, 'li').length, 0);
    });
  });
});
