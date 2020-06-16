import Vue from 'vue';
import Vuex from 'vuex';
import { generatePalette } from '@/utils/color-controller';
import * as Interface from '@/interface/interface';
import _ from 'lodash';
// @ts-ignore
import data from '../../public/data/modified-d.json';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    rawData: data as Interface.BasicObject[],
    filteredData: data as Interface.BasicObject[],
    unitData: [] as Interface.UnitObject[][],
    metricPerUnit: {} as Interface.MetricPerUnit, // unitData 의 metric range
    totalMetrics: [] as string[],
    selectedMetrics: [
      'clicks', 'cpc', 'frequency', 'impressions', 'reach', 'unique_ctr', 'cpm', 'ctr', 'actions#link_click',
    ] as string[],
    sortOption: [] as Interface.SortOptionItem[],
    filterOption: {} as Interface.FilterOption,
    weightController: {} as Interface.WeightController,
    dateUnit: 7,
    displayMetric: {
      metricPalette: generatePalette(10) as string[],
      selectedMetrics: _.range(10) as number[], // 나중에는 string[]으로 해야 함.
      metricsOrder: _.shuffle(_.range(10) as number[]) as number[], // palette 에 있는 metrics로
      focusedMetricIdx: 0 as number,
      focusedDayIndexes: [[], []] as [number[], number[]],
    },
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
});
