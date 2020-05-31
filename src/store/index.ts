import Vue from 'vue';
import Vuex from 'vuex';
import { generatePalette } from '@/utils/color-controller';
import * as Interface from '@/interface/interface';
import _ from 'lodash';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    rawData: [] as Interface.BasicObject[],
    selectedData: [] as Interface.BasicObject[],
    totalMetrics: [] as string[],
    dateRange: ['2020-01-01', '2020-04-30'] as [string, string],
    sortOption: [] as Interface.SortOptionItem[],
    filterOption: {
      startDate: ['2020-01-01', '2020-04-01'],
      endDate: ['2020-01-30', '2020-04-30'],
      showMax: 30,
    } as Interface.FilterOption,
    weightController: {} as Interface.WeightController,
    selectedMetrics: [] as string[],
    dateUnit: null as number | null,

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
