import _ from 'lodash';

const getSubDisplayDaily = (
  m: [number, number], // metric 종류의 개수
  r: [number, number], // min max 범위
) => _.times(Math.floor(Math.random() * 40 + 20), (i: number) => ({
  dayIndex: i,
  date: `date_${i}`,
  metrics: _.chain(_.range(m[1]))
    .shuffle()
    .take(Math.floor(Math.random() * (m[1] - m[0]) + m[0]))
    .map((d) => ({
      metric: d,
      value: Math.floor(Math.random() * (r[1] - r[0]) + r[0]),
    }))
    .keyBy('metric')
    .mapValues('value')
    .value(),
}));

export default getSubDisplayDaily;
