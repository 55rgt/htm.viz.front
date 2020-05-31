import { Vue, Component } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
import NavWeight from '@/components/NavWeight/NavWeight.vue';
import NavTree from '@/components/NavTree/NavTree.vue';


@Component({
  components: {
    NavWeight, NavTree,
  },
})
export default class Navigator extends Vue {
  private initialize() {
    // store.ts 여기서 초기화

    eventBus.$emit('initialize');
  }
}
