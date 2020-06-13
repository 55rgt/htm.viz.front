/* eslint-disable @typescript-eslint/camelcase */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const fs = require('fs');
//
// const data = JSON.parse(fs.readFileSync('../../public/data/modified.json', 'utf-8'));
//
// // insight 안에서 쓸 데이터
//
// const modified = _.chain(data)
//   .reduce((result, datum) => {
//     const item = datum;
//     const { metrics } = datum;
//     const arr = ['action_values', 'actions', 'cost_per_action_type', 'unique_actions'];
//     // eslint-disable-next-line no-restricted-syntax
//     for (const metric of arr) {
//       const keys = Object.keys(datum[metric]);
//       // eslint-disable-next-line no-restricted-syntax
//       for (const key of keys) {
//         metrics[`${metric}#${key}`] = datum[metric][key];
//       }
//       delete item[metric];
//     }
//     item.metrics = metrics;
//     result.push(item);
//     return result;
//   }, [])
//   .value();
//
// fs.writeFileSync('../../public/data/modified-d.json', JSON.stringify(modified, null, 2));

// eslint-disable-next-line consistent-return
// const getAvg = (data) => _.mergeWith({}, ...data, (a, b) => {
//   if (_.isNumber(b)) {
//     return ((b || 0) / data.length) + (_.isNumber(a) ? (a || 0) : 0);
//   }
// });
//
// const data1 = [
//   {
//     metrics: {
//       yt: 0, zt: 4, qa: 3, ft: 0,
//     },
//   },
//   {
//     metrics: {
//       yt: 2, zt: 3, qa: 1, op: 5,
//     },
//   },
// ];
//
// const data2 = [
//   {
//     yt: 0, zt: 4, qa: 3, ft: 0,
//   },
//   {
//     yt: 2, zt: 3, qa: 1, op: 5,
//   },
// ];
//
// console.log(getAvg(data2));
// eslint-disable-next-line no-irregular-whitespace
const u = [{ tom: 1 }, { roger: 2 }, { jake: 0.5 }];

const arr = ['roger', 'jake', 'tom'];
console.log(_.orderBy(u, (value, key) => arr.indexOf(key)));
