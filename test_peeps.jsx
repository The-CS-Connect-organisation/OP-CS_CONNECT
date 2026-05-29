import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Peep from 'react-peeps';

const svg = renderToStaticMarkup(React.createElement(Peep, {
  accessory: 'GlassRoundThick',
  body: 'BustPose',
  face: 'Smile',
  hair: 'ShortVolumed',
  facialHair: 'MoustacheThin',
  backgroundColor: '#fccb90'
}));

console.log(svg.substring(0, 100));
