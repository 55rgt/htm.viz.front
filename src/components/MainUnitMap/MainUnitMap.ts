import { Component, Vue } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
import _ from 'lodash';

@Component({
})
export default class MainUnitMap extends Vue {
  private mapData: {
    x: number;
    y: number;
    parentID: string;
    unitIndex: number;
    avgScore: number;
    rank: number;
  }[] = [];

  created() {
    eventBus.$on('updateView', () => {
      this.getData();
    });
  }

  private normalize(range: [number, number], value: number, fp: number) {
    // 둘 다 0이면 0으로 처리해야함
    return range[1] === range[0] ? 1 : +(((value - range[0]) / (range[1] - range[0])).toFixed(fp));
  }

  private getData() {
    console.log('getData');

    const metricList = this.$store.state.selectedMetrics;

    // 여기서 0 박아야 함.
    const normalized = _.chain(_.cloneDeep(this.$store.state.unitData))
      .flatten()
      .forEach((d) => {
        const dt = d;
        dt.metrics = _.chain(this.$store.state.selectedMetrics)
          .reduce((result, metric) => {
            const obj = result;
            if (_.isNil(dt.metrics[metric])) {
              obj[metric] = 0;
            } else {
              obj[metric] =
                this.normalize(this.$store.state.unitMetricPerUnit[metric], dt.metrics[metric], 2);
            }
            return obj;
          }, {} as {
            [metric: string]: number;
          })
          .value();
        return dt;
      })
      .value();
    //
    console.log(normalized);
    // 이거 아까다른컴포넌트걸로 바꾸기 ㅇㅇㅇ
    //
    // const meanMap = _.chain(metricList)
    //   .reduce((result, metric) => {
    //     const obj = result;
    //     obj[metric] = _.chain(normalized)
    //       .map((n) => n.metrics[metric])
    //       .filter((n) => !_.isNil(n))
    //       .value();
    //     return obj;
    //   }, {} as { [metric: string]: any })
    //   .forEach((v, k, obj) => {
    //     const newObj = obj;
    //     newObj[k] = +((_.sum(v) / v.length).toFixed(2));
    //     return newObj;
    //   })
    //   .value();
    //
    // console.log(meanMap);
    //
    // const refined = _.chain(_.cloneDeep(this.$store.state.unitData)
    //   .flatten()
    //   .forEach((d) => {
    //     // const scores =
    //     _.map(metrics, (m) => _.isNil(d.metrics[m]) ? 0 : 2 * d.metrics[m] - meanMap[m]);
    //     return ;
    //   })
    //   .value();


    /*
     1. this.$store.state.unitData =>
     */
  }
}
