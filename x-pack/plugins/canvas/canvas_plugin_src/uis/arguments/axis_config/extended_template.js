/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { EuiSelect, EuiFormRow, EuiText } from '@elastic/eui';
import { set } from 'object-path-immutable';
import { get } from 'lodash3';

const defaultExpression = {
  type: 'expression',
  chain: [
    {
      type: 'function',
      function: 'axisConfig',
      arguments: {},
    },
  ],
};

export class ExtendedTemplate extends React.PureComponent {
  static propTypes = {
    onValueChange: PropTypes.func.isRequired,
    argValue: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.shape({
        chain: PropTypes.array,
      }).isRequired,
    ]),
    typeInstance: PropTypes.object.isRequired,
    argId: PropTypes.string.isRequired,
  };

  // TODO: this should be in a helper, it's the same code from container_style
  getArgValue = (name, alt) => {
    return get(this.props.argValue, ['chain', 0, 'arguments', name, 0], alt);
  };

  // TODO: this should be in a helper, it's the same code from container_style
  setArgValue = name => ev => {
    const val = ev.target.value;
    const { argValue, onValueChange } = this.props;
    const oldVal = typeof argValue === 'boolean' ? defaultExpression : argValue;
    const newValue = set(oldVal, ['chain', 0, 'arguments', name, 0], val);
    onValueChange(newValue);
  };

  render() {
    const isDisabled = typeof this.props.argValue === 'boolean' && this.props.argValue === false;

    if (isDisabled) {
      return <EuiText color="subdued">The axis is disabled</EuiText>;
    }

    const positions = {
      xaxis: ['bottom', 'top'],
      yaxis: ['left', 'right'],
    };
    const argName = this.props.typeInstance.name;
    const position = this.getArgValue('position', positions[argName][0]);

    const options = positions[argName].map(val => ({ value: val, text: val }));

    return (
      <Fragment>
        <EuiFormRow label="Position" compressed>
          <EuiSelect value={position} options={options} onChange={this.setArgValue('position')} />
        </EuiFormRow>
      </Fragment>
    );
  }
}

ExtendedTemplate.displayName = 'AxisConfigExtendedInput';
