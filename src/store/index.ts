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
      focusedMetricIdx: 0 as number,
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
