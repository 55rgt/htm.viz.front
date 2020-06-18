import { Vue, Component, Watch } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
import MainItem from '@/components/MainItem/MainItem.vue';
import { UnitObject } from '@/interface/interface';
@Component({
  components: {
    MainItem,
  },
})
export default class MainItemList extends Vue {
  private itemListData: UnitObject[][] = [];

  private mounted() {
    eventBus.$on('updateView', () => {
      this.$store.state.selectedRadarIndex = [-1, -1];
      this.itemListData = this.$store.state.unitData;
    });
  }
}
