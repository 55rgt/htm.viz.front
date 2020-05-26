import Vue from 'vue';
import Vuex from 'vuex';
import { generatePalette } from '@/utils/color-controller';
import _ from 'lodash';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
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
