import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheck, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import App from './App/App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';

library.add(faCheck);
library.add(faSortAmountDown);

Vue.config.productionTip = false;

Vue.component('font-awesome-icon', FontAwesomeIcon);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
