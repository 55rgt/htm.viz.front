/* eslint-disable @typescript-eslint/camelcase */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('../../public/data/advertisements-d.json', 'utf-8'));

// insight 안에서 쓸 데이터

const modified = _.chain(data)
  .map((d) => d.data.insights)
  .map((d) => _.chain(d).orderBy(['date_start'], ['asc']).map((e, i) => ({
    parentID: e.adset_name,
    date: e.date_start,
    dateIndex: i,
    metrics: {
      clicks: +(+e.clicks).toFixed(2),
      cpc: +(+e.cpc).toFixed(2),
      cpm: +(+e.cpm).toFixed(2),
      ctr: +(+e.ctr).toFixed(2),
      frequency: +(+e.frequency).toFixed(2),
      impressions: +(+e.impressions).toFixed(2),
      reach: +(+e.reach).toFixed(2),
      unique_clicks: +(+e.unique_clicks).toFixed(2),
      unique_ctr: +(+e.unique_ctr).toFixed(2),
    },
    action_values: _.chain(e.action_values)
      .map((f) => [f.action_type, +(+f.value).toFixed(2)])
      .orderBy((d) => d[1], ['desc'])
      .fromPairs()
      .value(),
    actions: _.chain(e.actions)
      .map((f) => [f.action_type, +(+f.value).toFixed(2)])
      .orderBy((d) => d[1], ['desc'])
      .fromPairs()
      .value(),
    cost_per_action_type: _.chain(e.cost_per_action_type)
      .map((f) => [f.action_type, +(+f.value).toFixed(2)])
      .orderBy((d) => d[1], ['desc'])
      .fromPairs()
      .value(),
    unique_actions: _.chain(e.unique_actions)
      .map((f) => [f.action_type, +(+f.value).toFixed(2)])
      .orderBy((d) => d[1], ['desc'])
      .fromPairs()
      .value(),
  })).value())
  .flattenDeep()
  .value();

fs.writeFileSync('../../public/data/modified.json', JSON.stringify(modified, null, 2));
