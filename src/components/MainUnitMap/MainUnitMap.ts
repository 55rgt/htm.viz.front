import { Component, Vue } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
import { SVG } from '@/interface/interface';
import _ from 'lodash';
import axios from 'axios';
import * as d3 from 'd3';

@Component({})
export default class MainUnitMap extends Vue {
  private unitMapSVG!: SVG;

  private unitMapData: {
    x: number;
    y: number;
    parentID: string;
    unitIndex: number;
    avgScore: number;
    rank: number;
  }[] = [];

  created() {
    eventBus.$on('updateView', () => {
      this.initialize().then((r) => {
        console.log(r);
        console.log(this.unitMapData);
        this.remove();
        this.drawElements();
      });
    });
  }

  public $refs!: {
    unitMap: HTMLElement;
  };

  private remove() {
    console.log('removed');
    d3.select(`#${this.unitMapSVG.svgID}`).remove();
  }

  private drawElements() {
    const that = this;
    console.log('drawElements');
    this.unitMapSVG.svg = d3.select('#UnitMap')
      .append('svg')
      .attr('id', this.unitMapSVG.svgID)
      .attr('width', this.unitMapSVG.width)
      .attr('height', this.unitMapSVG.height);
  }

  private async initialize() {
    this.unitMapSVG = {
      svgID: 'svgUnitMap',
      width: this.$refs.unitMap.offsetWidth,
      height: this.$refs.unitMap.offsetHeight,
      svg: null,
    };
    await this.getData();
  }

  private normalize(range: [number, number], value: number, fp: number) {
    // 둘 다 0이면 0으로 처리해야함
    return range[1] === range[0] ? 1 : +(((value - range[0]) / (range[1] - range[0])).toFixed(fp));
  }

  private getData() {
    // console.log('getData');

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

    // console.log(normalized);

    const meanMap = _.chain(metricList)
      .reduce((result, metric) => {
        const obj = result;
        obj[metric] = _.chain(normalized)
          .map((n) => n.metrics[metric])
          .filter((n) => !_.isNil(n))
          .value();
        return obj;
      }, {} as { [metric: string]: any })
      .forEach((v, k, obj) => {
        const newObj = obj;
        newObj[k] = +((_.sum(v) / v.length).toFixed(2));
        return newObj;
      })
      .value();
    // console.log(meanMap);

    const refined: {
      parentID: string;
      unitIndex: number;
      avgScore: number;
      scores: number[];
    }[] = _.chain(_.cloneDeep(normalized))
      .map((d) => {
        const cloned = _.cloneDeep(d.metrics);
        _.forEach(cloned, (v, k, obj) => {
          const newObj = obj;
          const weight = _.isNil(this.$store.state.weightController[k])
            ? 1 : this.$store.state.weightController[k];
          newObj[k] = +((weight * v + (1 - weight) * meanMap[k]).toFixed(2));
          return newObj;
        });
        const sortedScores = _.chain(cloned)
          .entries()
          .orderBy((d) => d[0], 'asc')
          .map((d) => d[1])
          .value();
        return {
          parentID: d.parentID,
          unitIndex: d.unitIndex,
          avgScore: +((_.sum(sortedScores) / sortedScores.length).toFixed(2)),
          scores: sortedScores,
        };
      })
      .value();

    axios
      .post('http://127.0.0.1:5000/make-data', refined)
      .then((result) => {
        if (refined.length !== result.data.length) {
          console.log('Error');
        }
        this.unitMapData = _.map(result.data, (d: [number, number], i: number) => {
          const r = refined[i];
          return {
            x: +(d[0].toFixed(2)),
            y: +(d[1].toFixed(2)),
            parentID: r.parentID,
            unitIndex: r.unitIndex,
            avgScore: r.avgScore,
            rank: _.chain(refined)
              .filter((d) => d.parentID === r.parentID)
              .orderBy(['avgScore'], ['desc'])
              .findIndex((o) => o.unitIndex === r.unitIndex)
              .value(),
          };
        });
        return this.unitMapData;
      })
      .catch((error) => {
        console.error('Error Occurred', error);
      });

    /*
     1. this.$store.state.unitData =>
     */
  }
}
