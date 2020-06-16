import { Vue, Component, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import { eventBus } from '@/utils/event-bus';
import { BasicObject } from '@/interface/interface';

@Component({
})
export default class NavTree extends Vue {
  private checkBox: string[] = this.getParents();

  private getParents() {
    return _.chain(this.$store.state.rawData)
      .map((d) => d.parentID)
      .uniq()
      .value();
  }

  // private initialize() {
  //   // store.ts 여기서 초기화
  //   this.$store.state.selectedData = _.filter(this.$store.state.rawData,
  //     (d: BasicObject) => this.checkBox.indexOf(d.parentID) !== -1);
  //
  //   const dates = _.chain(this.$store.state.selectedData)
  //     .map((d: BasicObject) => d.date)
  //     .uniq()
  //     .sort()
  //     .value();
  //
  //   this.$store.state.totalMetrics = ['clicks', 'cpc', 'cpm', 'ctr', 'frequency', 'impressions', 'reach', 'unique_clicks', 'unique_ctr'];
  //   this.$store.state.dateRange = [dates[0], dates[dates.length - 1]];
  //   this.$store.state.sortOption = [];
  //   this.$store.state.filterOption = {
  //     startDate: this.$store.state.dateRange,
  //     endDate: this.$store.state.dateRange,
  //     showMax: this.checkBox.length,
  //   };
  //   this.$store.state.weightController = {
  //     clicks: 1,
  //     cpc: 1,
  //     cpm: 1,
  //     ctr: 1,
  //     frequency: 1,
  //     impressions: 1,
  //     reach: 1,
  //     unique_clicks: 1,
  //     unique_ctr: 1,
  //   };
  //   this.$store.state.selectedMetrics = [];
  //   this.$store.state.dateUnit = 1;
  //
  //   eventBus.$emit('updateView');
  // }
}
