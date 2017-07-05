import React, { Component, Children } from "react";
import PropTypes from "prop-types";
import { storiesOf } from "@kadira/storybook";

const createStore = (reducer, initialState) => {
  let state = reducer(initialState, { type: "@@INIT@@" });
  let listeners = [];

  const getState = () => state;

  const subscribe = listener => {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };


  const dispatch = action => {
    if (action instanceof Function) {
      action(dispatch);
    } else {
      state = reducer(state, action);
      listeners.forEach(listener => listener());
    }
  };

  return {
    getState,
    subscribe,
    dispatch,
  };
};

const INCREMENT = "INCREMENT";
const increment = () => dispatch => {
  Promise.resolve().then(() => {
    dispatch({ type: INCREMENT });
  });
};

const PATATIZE = "PATATIZE";
const patatize = () => ({ type: PATATIZE });

const count = (state = 40, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    default:
      return state;
  }
};

const getCount = state => state;

const potatoes = (state = 0, action) => {
  switch (action.type) {
    case PATATIZE:
      return state + 1;
    default:
      return state;
  }
};

const combineReducers = reducers => (state = {}, action) =>
  Object.keys(reducers).reduce((newState, key) => ({ ...newState, [key]: reducers[key](state[key], action) }), {});

const counters = combineReducers({ count, potatoes });

const getCountersCount = state => getCount(state.count);



const reducer = combineReducers({
  forlayos: counters,
});

const getApplicationCountersCount = state => getCountersCount(state.forlayos);

const store = createStore(reducer);

store.subscribe(() => { console.log("NEW STATE", store.getState()) });

const Counter = ({ count }) => <div>{count} clicks</div>;

const Button = ({ children, onClick }) => {
  const handler = e => {
    e.preventDefault();
    onClick();
  };

  return <button onClick={handler}>{children}</button>;
};

const identity = () => ({});

class Provider extends Component {

  static childContextTypes = {
    store: PropTypes.object,
  }

  getChildContext() {
    return {
      store: this.props.store,
    };
  }

  render() {
    return Children.only(this.props.children);
  }
}

const connect = (mapStateToProps, mapDispatchToProps) => WrappedComponent => {

  class Connected extends Component {

    state = {
      reduxState: this.context.store.getState(),
    }

    componentDidMount() {
      this.unsubscribe = this.context.store.subscribe(() => {
        this.setState({
          reduxState: this.context.store.getState(),
        });
      });
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }

    render() {
      const stateProps = (mapStateToProps || identity)(this.state.reduxState, this.props);
      const handlers = (mapDispatchToProps || identity)(this.context.store.dispatch, this.props);
      const connectedProps = {
        ...this.props,
        ...stateProps,
        ...handlers,
        dispatch: this.context.store.dispatch,
      };

      return <WrappedComponent {...connectedProps} />;
    }
  }

  Connected.contextTypes = Provider.childContextTypes;

  Connected.displayName = `connected(${WrappedComponent.displayName})`;

  return Connected;
}

const ConnectedCounter = connect(
  state => ({
    count: getApplicationCountersCount(state),
  }),
)(Counter);

const ConnectedButton = connect(
  null,
  dispatch => ({
    onClick: () => dispatch(increment()),
  })
)(Button);


const App = () => (
  <Provider store={store}>
    <div>
      <ConnectedCounter />
      <ConnectedButton>Click me!</ConnectedButton>
    </div>
  </Provider>
);

storiesOf("Poor man redux", module).add("redux", () => <App />);
