import { Component, Vue } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
import _ from 'lodash';
import { BasicObject, MetricPerUnit, UnitObject } from '@/interface/interface';

@Component({
})
export default class Nav extends Vue {
  private tableHeaders: {
    text: string;
    align?: string;
    sortable?: boolean;
    value: string;
  }[] = [{
    text: 'parentID',
    align: 'start',
    value: 'parentID',
  }];

  private totalTableList: {
    [metric: string]: string | number;
  }[] = [];

  private filteredTableList: {
    [metric: string]: string | number;
  }[] = [];

  private mounted() {
    this.$store.state.totalMetrics = _.chain(this.$store.state.rawData)
      .map((d) => Object.keys(d.metrics))
      .flatten()
      .uniq()
      .value()
      .sort();

    this.tableHeaders = this.tableHeaders.concat(
      _.map(this.$store.state.totalMetrics, (d) => ({ text: d, value: d })),
    );

    this.totalTableList = _.chain(this.$store.state.rawData)
      .groupBy((d) => d.parentID)
      .map((value, key) => {
        const obj = this.getAvg(_.map(value, (v) => v.metrics));
        obj.parentID = key;
        return obj;
      })
      .value();

    this.filteredTableList = this.totalTableList;
    // filteredTableList 에서 필터 및 소팅을  해서 parentID를 뽑아냄. 그걸 가지고 unitData
  }

  private updateView() {
    this.$store.state.unitData = _.chain(this.$store.state.filteredData)
      .groupBy((d: BasicObject) => d.parentID)
      .values()
      .map((d: BasicObject[]) => _.chain(d)
        .groupBy((e: BasicObject) => Math.floor(e.dateIndex / this.$store.state.dateUnit))
        .values()
        .map((value: BasicObject[]) => ({
          parentID: value[0].parentID,
          metrics: this.getAvg(_.map(value, (v) => v.metrics)),
          dateIndexes: _.map(value, (v) => v.dateIndex),
          dates: _.map(value, (v) => v.date),
          unitIndex: value[0].dateIndex / this.$store.state.dateUnit,
        }) as UnitObject)
        .orderBy(['unitIndex'], ['asc'])
        .value())
      .value();

    // this.$store.state.selectedMetrics = _.chain(this.$store.state.totalMetrics)
    //   .shuffle()
    //   .slice(0, Math.floor(Math.random() * 4 + 6))
    //   .value();

    // unitMetricPerUnit 만들고 emit 해서 on 해서 라디오차트 데이터 만들기
    const obj: MetricPerUnit = {};
    for (let i = 0; i < this.$store.state.selectedMetrics.length; i += 1) {
      const key = this.$store.state.selectedMetrics[i];
      const values = _.chain(_.flatten(this.$store.state.unitData))
        .filter((d: UnitObject) => !_.isNil(d.metrics[key]))
        .map((d: UnitObject) => +d.metrics[key])
        .value();
      const min = _.min(values);
      const max = _.max(values);
      // @ts-ignore
      obj[key] = [min, max];
    }
    this.$store.state.unitMetricPerUnit = obj;
    eventBus.$emit('updateView');
  }

  // eslint-disable-next-line consistent-return
  private getAvg = (data: any) => _.mergeWith({}, ...data, (a: any, b: any) => {
    if (_.isNumber(b)) {
      return +((((b || 0) / data.length) + (_.isNumber(a) ? (a || 0) : 0)).toFixed(2));
    }
  });
}
