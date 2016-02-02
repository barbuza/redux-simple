import React from 'react';
import PureComponent from 'react-pure-render/component';
import hoistStatics from 'hoist-non-react-statics';
import raf from 'raf';
import asap from 'asap';

import storeShape from './storeShape';

const defaultMapProps = () => ({});
const defaultMapActions = dispatch => ({ dispatch });

const subscriptionQueue = [];
let subscriptionScheduled = false;

function flushSubscriptionQueue() {
  for (const subscribe of subscriptionQueue) {
    subscribe();
  }
  subscriptionQueue.splice(0, subscriptionQueue.length);
  subscriptionScheduled = false;
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
        this.actions = finalMapActions(this.context.store.dispatch, this.props);
        this.state = this.stateFromStore();
      }

      componentDidMount() {
        subscriptionQueue.unshift(::this.subscribe);
        if (!subscriptionScheduled) {
          subscriptionScheduled = true;
          asap(flushSubscriptionQueue);
        }
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
