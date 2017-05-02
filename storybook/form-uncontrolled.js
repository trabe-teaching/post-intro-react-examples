import React, { Component, Children } from "react";
import PropTypes from "prop-types";
import { storiesOf } from "@kadira/storybook";

const blueTheme = { color: "#0000bb" };
const redTheme = { color: "#bb0000" };

const MyForm = () => {
  let input;

  const handleSubmit = event => {
    event.preventDefault();
    alert(input.value);
  }

  return (
    <form>
      <input ref={i => input = i} type="text" defaultValue="5" />
      <button onClick={handleSubmit}>Submit!</button>
    </form>
  );
}

storiesOf("Form", module).add("Form uncontrolled", () => <MyForm />);
