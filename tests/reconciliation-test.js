import test, { wait } from './base';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { createStore } from 'redux'

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
class List extends React.PureComponent {

  componentDidMount() {
    this.props.dispatch({
      type: 'REMOVE'
    });
  }

  render() {
    return (
      <ul>
        {this.props.items.map((_, index) => <Item key={index} index={index} />)}
      </ul>
    );
  }

}

@connect((state, { index }) => ({ value: state.items[index].value }))
class Item extends React.PureComponent {

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

  wait(() => {
    t.equal(TestUtils.scryRenderedDOMComponentsWithTag(res, 'li').length, 0);
  });

});
