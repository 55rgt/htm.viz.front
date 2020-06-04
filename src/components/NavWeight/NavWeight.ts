import { Vue, Component } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';

@Component({

})
export default class NavWeight extends Vue {
  private min = 0;

  private max = 2;

  private slider = 1;
}
