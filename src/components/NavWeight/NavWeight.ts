import { Vue, Component, Watch } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';

@Component({})
export default class NavWeight extends Vue {
  mounted() {
    eventBus.$on('updateView', () => {
      this.controller = this.$store.state.weightController;
    });
  }

  private min = 0;

  private max = 2;

  private controller = this.$store.state.weightController;
}
