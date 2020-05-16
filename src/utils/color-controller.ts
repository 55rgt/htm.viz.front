import convert from 'color-convert';
import _ from 'lodash';

export const generatePalette = (k: number) => _.chain(k)
  // @ts-ignore
  .times((i) => `#${convert.hsv.hex((360 / k) * i, 60, 100)}`)
  .reduce((result, value, index) => {
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    result[index] = value;
    return result;
  }, {})
  .value();

export const shadeColor = (color: string, percent: number) => {
  let R: number = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.floor((R * (100 + percent)) / 100);
  G = Math.floor((G * (100 + percent)) / 100);
  B = Math.floor((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  const RR = R.toString(16).length === 1 ? `0${R.toString(16)}` : R.toString(16);
  const GG = G.toString(16).length === 1 ? `0${G.toString(16)}` : G.toString(16);
  const BB = B.toString(16).length === 1 ? `0${B.toString(16)}` : B.toString(16);

  return `#${RR}${GG}${BB}`;
};
