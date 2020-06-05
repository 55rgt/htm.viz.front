import Vue from 'vue';
import Vuex from 'vuex';
import { generatePalette } from '@/utils/color-controller';
import * as Interface from '@/interface/interface';
import _ from 'lodash';
// @ts-ignore
import data from '../../public/data/modified.json';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    rawData: data as Interface.BasicObject[],
    selectedData: [] as Interface.BasicObject[],
    totalMetrics: [],
    dateRange: ['', ''] as [string, string], //
    sortOption: [] as Interface.SortOptionItem[],
    filterOption: {
      startDate: ['', ''] as [string, string], //
      endDate: ['', ''] as [string, string], //
      showMax: 30,
    } as Interface.FilterOption,
    weightController: {} as Interface.WeightController,
    selectedMetrics: [] as string[],
    dateUnit: 1,

    displayMetric: {
      metricPalette: generatePalette(10) as string[],
      selectedMetrics: _.range(10) as number[], // 나중에는 string[]으로 해야 함.
      metricsOrder: _.shuffle(_.range(10) as number[]) as number[], // palette 에 있는 metrics로
      focusedMetricIdx: 0 as number,
      focusedDayIndexes: [[], []] as [number[], number[]],
    },
    dayUnit: 3,
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
});
