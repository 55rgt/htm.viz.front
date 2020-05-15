import { Vue, Component } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
@Component({
})
export default class SubDisplay extends Vue {
  private tempCallSubGraph() {
    eventBus.$emit('updateSubGraph');
  }
}
