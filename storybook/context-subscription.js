import React, { Component, Children, PropTypes } from "react";
import { storiesOf } from "@kadira/storybook";

class LocaleProvider extends Component {
  static childContextTypes = {
    locale: PropTypes.string,
  };

  getChildContext() {
    return {
      locale: this.props.locale,
    };
  }

  render() {
    return Children.only(this.props.children);
  }
}

const withLocale = WrappedComponent => {
  class Wrapper extends Component {

    state = {
      locale: this.context.locale,
    }

    render() {
      <WrappedComponent locale={this.state.locale} {...this.props} />;
    }
  };

  Wrapper.contextTypes = LocaleProvider.childContextTypes;
  Wrapper.displayName = `withLocale(${WrappedComponent.displayName})`;

  return Wrapper;
};

let CurrentLocale = ({ locale }) => <p>Current locale: {locale}</p>;
CurrentLocale = withLocale(CurrentLocale);

const translations = {
  es: {
    greeting: "Hola!",
  },
  en: {
    greeting: "Hi!",
  },
};

let T = ({ locale, id }) => <span>{translations[locale][id]}</span>;
T = withLocale(T);

class Container extends Component {

  state = {
    currentLocale: "es",
  }

  changeLocale = locale => this.setState({
    currentLocale: locale,
  });

  render() {
    return (
      <LocaleProvider locale={this.state.currentLocale}>
        <div>
          <button onClick={() => this.changeLocale("es")}>ES</button>
          <button onClick={() => this.changeLocale("en")}>EN</button>
          <CurrentLocale />
          <T id="greeting" />
        </div>
      </LocaleProvider>
    );
  }
}

storiesOf("Context", module).add("Subscription", () => <Container />);

