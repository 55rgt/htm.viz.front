import { Vue, Component } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';

@Component({

})
export default class NavWeight extends Vue {

  created() {
    eventBus.$on('initialize', () => {});

    eventBus.$on('updateData', () => {});
  }
}
