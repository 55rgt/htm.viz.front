import { Vue, Component } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
@Component({
})
export default class MainUnitMap extends Vue {
  created() {
    eventBus.$on('initialize', () => {
      console.log('initialize');
    });
  }
}
