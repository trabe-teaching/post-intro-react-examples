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
      listeners = listeners.select(l => l !== listener);
    };
  };

  const dispatch = action => {
    state = reducer(state, action);
    listeners.forEach(l => l());
  };

  return {
    getState,
    subscribe,
    dispatch,
  };
};

const initialState = {
  count: 0,
  potato: "nope",
};

const INCREMENT = "INCREMENT";
const PATATIZE = "PATATIZE";
const increment = () => ({ type: INCREMENT });

const potato = (state = initialState.potato, { type }) => {
  switch(type) {
    case PATATIZE:
      return "yes";

    default:
      return state;
  }
};

const count = (state = initialState.count, { type }) => {
  switch(type) {
    case INCREMENT:
      return state + 1;
    default:
      return state;
  }
};


const combineReducers = reducers => (state, action) =>
  Object.keys(reducers).reduce((s, k) => {
    s[k] = reducers[k](state && state[k], action);
    return s;
  }, {});

const getCount = state => state.count;



const reducer = combineReducers({ count, potato });
const store = createStore(reducer);

class Provider extends Component {

  getChildContext() {
    return {
      store: this.props.store,
    }
  }

  render() {
    return Children.only(this.props.children);
  }
}

Provider.childContextTypes = {
  store: PropTypes.object,
};


const connect = (mapStateToProps = () => ({}), mapDispatchToProps = () => ({})) => WrappedComponent => {
  class Wrapper extends Component {

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

    shouldComponentUpdate(nextState, nextProps) {
      return this.state !== nextState;
    }

    render() {
      const computedProps = {
        ...this.props,
        ...mapStateToProps(this.state.reduxState, this.props),
        ...mapDispatchToProps(this.context.store.dispatch, this.props),
        dispatch: this.context.store.dispatch,
      };

      return <WrappedComponent {...computedProps } />
    }
  }

  Wrapper.contextTypes = Provider.childContextTypes;

  Wrapper.displayName = `connected(${WrappedComponent.displayName})`;
  return Wrapper;
};


const Counter = ({ count }) => <div>{count} clicks</div>;

const ConnectedCounter = connect(
  state => ({
    count: getCount(state),
  })
)(Counter);

const Button = ({ children, onClick }) => {
  const handler = e => {
    e.preventDefault();
    onClick();
  };

  return <button onClick={handler}>{children}</button>;
}


const ConnectedButton = connect(
  undefined,
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
