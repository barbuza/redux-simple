import React from 'react';
import PureComponent from 'react-pure-render/component';
import hoistStatics from 'hoist-non-react-statics';
import raf from 'raf';
import asap from 'asap';

import storeShape from './storeShape';

const defaultMapProps = () => ({});
const defaultMapActions = dispatch => ({ dispatch });

const subscriptionQueue = [];
const dispatchQueue = [];

let asapScheduled = false;

function flushAsapQueue(dispatch) {
  for (const subscribe of subscriptionQueue) {
    subscribe();
  }
  for (const { action, resolve, reject } of dispatchQueue) {
    Promise.resolve(dispatch(action)).then(resolve).catch(reject);
  }
  subscriptionQueue.splice(0, subscriptionQueue.length);
  dispatchQueue.splice(0, dispatchQueue.length);
  asapScheduled = false;
}

function scheduleAsapFlush(dispatch) {
  if (!asapScheduled) {
    asapScheduled = true;
    asap(() => flushAsapQueue(dispatch));
  }
}

function makeDispatchAsap(dispatch) {
  return action => new Promise((resolve, reject) => {
    dispatchQueue.push({
      action,
      resolve,
      reject
    });
    scheduleAsapFlush(dispatch);
  });
}

export default (mapProps, mapActions) => {
  const finalMapProps = mapProps || defaultMapProps;

  let finalMapActions = defaultMapActions;
  if (typeof mapActions === 'object') {
    finalMapActions = dispatch => {
      const actions = {};
      Object.keys(mapActions).forEach(key => {
        actions[key] = (...args) => dispatch(mapActions[key](...args));
      });
      return actions;
    };
  } else if (typeof mapActions === 'function') {
    finalMapActions = mapActions;
  }

  return component => {
    class Wrapper extends PureComponent {

      static WrappedComponent = component;

      static displayName = `connect-raf(${component.name})`;

      static contextTypes = {
        store: storeShape.isRequired
      };

      constructor(props, context) {
        super(props, context);
        const dispatch = makeDispatchAsap(this.context.store.dispatch);
        this.actions = finalMapActions(dispatch, this.props);
        this.state = this.stateFromStore();
      }

      componentDidMount() {
        subscriptionQueue.unshift(::this.subscribe);
        scheduleAsapFlush(this.context.store.dispatch);
      }

      subscribe() {
        if (!this.unmount) {
          this.unsubscribe = this.context.store.subscribe(::this.scheduleUpdate);
        }
      }

      componentWillUnmount() {
        this.unmount = true;
        if (this.rafHandle) {
          raf.cancel(this.rafHandle);
          this.rafHandle = null;
        }
        if (this.unsubscribe) {
          this.unsubscribe();
        }
      }

      scheduleUpdate() {
        if (!this.rafHandle) {
          this.rafHandle = raf(::this.updateFromStore);
        }
      }

      updateFromStore() {
        if (!this.unmount) {
          this.rafHandle = null;
          this.setState(this.stateFromStore());
        }
      }

      stateFromStore() {
        const props = finalMapProps(this.context.store.getState(), this.props);
        return { ...props, ...this.actions };
      }

      render() {
        return React.createElement(component, { ...this.props, ...this.state });
      }

    }

    return hoistStatics(Wrapper, component);
  };
};
