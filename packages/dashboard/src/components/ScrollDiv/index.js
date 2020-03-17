import React, { useState, useLayoutEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useWindowSize } from '@reach/window-size';

const ScrollDiv = ({ children, height, auto = false, resAuto = false }) => {
  const { width: Width, height: Height } = useWindowSize();
  const innerHeight = height !== 0 ? Height - height : 'auto';
  const isMobile = Width < 1200;
  return (
    <PerfectScrollbar
      style={
        !isMobile
          ? {
              maxHeight: innerHeight,
              minHeight: 250,
              height: !auto ? innerHeight : 'auto',
            }
          : {
              maxHeight: !resAuto
                ? Height < 550
                  ? 550
                  : innerHeight
                : innerHeight,
            }
      }
    >
      {children}
    </PerfectScrollbar>
  );
};

export default ScrollDiv;
