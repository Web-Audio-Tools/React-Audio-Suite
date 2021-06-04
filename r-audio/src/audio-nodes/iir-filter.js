import React from "react";
import RConnectableNode from "./../base/connectable-node.js";
import PropTypes from "prop-types";

export default class RIIRFilter extends RConnectableNode {
  constructor(props) {
    super(props);

    this.params = {};
  }

  componentWillMount() {
    super.componentWillMount();

    if (!this.node) {
      this.node = this.context.audio.createIIRFilter({
        feedback: this.props.feedback,
        feedforward: this.props.feedforward,
      });

      this.context.nodes.set(this.props.identifier, this.node);
    }

    this.updateParams = this.updateParams.bind(this);
    this.updateParams(this.props);
  }

  render() {
    if (typeof this.props.children === "function") {
      const filterProxy = Object.freeze({
        getFrequencyResponse: (frequencyHz, magResponse, phaseResponse) => {
          return this.node.getFrequencyResponse(
            frequencyHz,
            magResponse,
            phaseResponse
          );
        },
      });

      this.props.children(filterProxy);
    }

    return super.render();
  }
}

RIIRFilter.propTypes = {
  children: PropTypes.func,
};
