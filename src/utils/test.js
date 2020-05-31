// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DateGenerator = require('random-date-generator');


console.log('a');

const numOfAds = Math.floor(Math.random() * 60) + 20;

const periodRange = [20, 30];

const totalMetrics = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const dateRange = ['2020-01-01', '2020-04-30'];

const a = DateGenerator
  .getRandomDateInRange(new Date(2020, 0, 1), new Date(2020, 4, 1))
  .toLocaleDateString();

console.log(a);

const formatDate = () => {
  const date = DateGenerator
    .getRandomDateInRange(new Date(2020, 0, 1), new Date(2020, 4, 1))
    .toLocaleDateString();
  const split = date.split('/');
  return `${split[2]}-${split[1]}-${split[0]}`;
};

const data = _.chain(numOfAds)
  .times((d) => ({
    parentID: `parent_${d}`,
    date: formatDate(),

  }))
  .value();


console.log(data);

// 2020-10-10, 2020-01-01 2020-10-11
console.log(['2020-10-12', '2020-01-01', '2020-10-11'].sort());
