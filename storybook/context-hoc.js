import React, { Component, Children, PropTypes } from 'react';
import { storiesOf } from '@kadira/storybook';

class LocaleProvider extends Component {

  static childContextTypes = {
    locale: PropTypes.string,
  }

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
  const Wrapper = (props, { locale }) =>
    <WrappedComponent locale={locale} {...props} />

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
};

let T = ({ locale, id }) => <span>{translations[locale][id]}</span>;
T = withLocale(T);

storiesOf('Context', module)
  .add('HOC', () => (
    <LocaleProvider locale="es">
      <div>
        <CurrentLocale />
        <T id="greeting" />
      </div>
    </LocaleProvider>
  ));

