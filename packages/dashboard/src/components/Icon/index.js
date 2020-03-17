import React from 'react';
import { renderIconDefinitionToSVGElement } from '@ant-design/icons-svg/lib/helpers';

const Icon = ({ type, className }) => {
  const SvgIcon = icon => {
    return renderIconDefinitionToSVGElement(icon, {
      extraSVGAttrs: { width: '1em', height: '1em', fill: 'currentColor' },
    });
  };
  return (
    <>
      <i
        className={className ? `${className} anticon` : 'anticon'}
        dangerouslySetInnerHTML={{ __html: SvgIcon(type) }}
      />
    </>
  );
};
export default Icon;
