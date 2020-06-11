import { Component, Prop, Vue } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
import {
  Circle, SVG, UnitObject, RadarChart,
} from '@/interface/interface';
import _ from 'lodash';
import * as d3 from 'd3';

@Component({})
export default class MainItem extends Vue {
  private radarChartSVG!: SVG;

  private innerCircles: Circle[] = [];

  // 전체기간
  private totalRadarChart: RadarChart[] = [];

  // 선택 기간
  private focusedRadarChart: RadarChart[] = [];


  private center: {
    cx: number;
    cy: number;
    r: number;
  } = {
    cx: 1,
    cy: 1,
    r: 1,
  };

  @Prop(String) private classID!: string;

  @Prop(Number) private idx!: number;

  private testData = [
    [[40, 97], [97, 40], [137, 97], [97, 137]],
    [[40, 88], [80, 40], [141, 60], [147, 125], [82, 150]],
  ];

  public $refs!: {
    radarChart: HTMLElement;
  };

  private initialize() {
    this.radarChartSVG = {
      svgID: `svg${this.classID}`,
      width: this.$refs.radarChart.offsetWidth,
      height: this.$refs.radarChart.offsetHeight,
      svg: null,
    };

    this.center = {
      cx: this.radarChartSVG.width / 2,
      cy: this.radarChartSVG.height / 2 - 15,
      r: this.radarChartSVG.width / 2 - 20,
    };

    this.innerCircles = _.times(4, (idx: number) => ({
      cx: this.center.cx,
      cy: this.center.cy,
      r: ((idx + 1) * this.center.r) / 4,
    }));

    const totalDistribution: {
     [metric: string]: number;
    } = this.getAvg(_.chain(this.$store.state.unitData[this.idx])
      .map((d) => d.metrics)
      .value());

    this.totalRadarChart = _.chain(totalDistribution)
      .entries()
      .filter((d) => this.$store.state.selectedMetrics.indexOf(d[0]) !== -1)
      .map((d) => ({
        metric: d[0],
        value: d[1],
      }))
      .orderBy((d) => this.$store.state.selectedMetrics.indexOf(d.metric), ['asc'])
      .value();

    this.focusedRadarChart = this.totalRadarChart;
  }

  private created() {
    // 버그
    eventBus.$on('updateView', () => {
      this.initialize();
      this.remove();
      this.drawElements();
    });
  }

  private remove() {
    d3.select(`#${this.radarChartSVG.svgID}`).remove();
  }

  private getScoreRatio(key: string, value: number) {
    const metric = this.$store.state.unitMetricPerUnit[key];
    if (_.isNil(metric)) {
      console.error('Error');
      return -1;
    }
    return (metric[0] === metric[1] ?
      1 : +((value - metric[0]) / (metric[1] - metric[0])).toFixed(2));
  }

  private updateItem() {
    this.radarChartSVG.svg.select('.totalDots')
      .selectAll('circle')
      .data(this.totalRadarChart)
      .join(
        (enter: any) => enter
          .append('circle')
          .attr('cx', this.center.cx)
          .attr('cy', this.center.cy),
        (update: any) => update,
        (exit: any) => exit.call((exit: any) => exit.remove()),
      )
      .on('mouseover', function (d: any) {
        // @ts-ignore
        d3.select(this).attr('r', 4);
      })
      .on('mouseout', function (d: any) {
        // @ts-ignore
        d3.select(this).attr('r', 3);
      })
      .transition()
      .duration(300)
      .attr('cx', (d: RadarChart, i: number) => this.rotate(
        {
          x: this.center.cx,
          y: this.center.cy - this.center.r * this.getScoreRatio(d.metric, d.value),
        },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).x)
      .attr('cy', (d: RadarChart, i: number) => this.rotate(
        {
          x: this.center.cx,
          y: this.center.cy - this.center.r * this.getScoreRatio(d.metric, d.value),
        },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).y)
      .attr('r', 3)
      .attr('fill', 'pink');

    const totalPathData = _.map(this.totalRadarChart, (d, i) => {
      const point = this.rotate(
        {
          x: this.center.cx,
          y: this.center.cy - this.center.r * this.getScoreRatio(d.metric, d.value),
        },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      );
      return [point.x, point.y];
    });

    const path = _.reduce(totalPathData, (result, data, index) => {
      let r = result;
      if (index === 0) {
        r += `M ${data[0]} ${data[1]}`;
      } else if (index === totalPathData.length - 1) {
        r += `L ${data[0]} ${data[1]}`;
        r += `L ${totalPathData[0][0]} ${totalPathData[0][1]}`;
      } else {
        r += `L ${data[0]} ${data[1]}`;
      }
      return r;
    }, '');

    this.radarChartSVG.svg.select('.radarPath')
      .selectAll('path')
      .data(totalPathData)
      .join(
        (enter: any) => enter.append('path'),
        (update: any) => update.transition()
          .duration(300),
        (exit: any) => exit.call((exit: any) => exit.remove()),
      )
      .transition()
      .duration(300)
      .attr('d', path)
      .attr('stroke', 'pink')
      .attr('stroke-width', 1.5)
      .attr('fill', 'pink')
      .attr('fill-opacity', 0.1);
  }

  private drawElements() {
    // Append SVG
    this.radarChartSVG.svg = d3.select(`#${this.classID}`)
      .append('svg')
      .attr('id', this.radarChartSVG.svgID)
      .attr('width', this.radarChartSVG.width)
      .attr('height', this.radarChartSVG.height);
    // Append Inner Circles
    const innerCircles = this.radarChartSVG.svg.append('g').attr('class', 'innerCircles');

    // Append Lines
    const lines = this.radarChartSVG.svg.append('g').attr('class', 'lines');

    lines
      .selectAll('line')
      .data(this.$store.state.selectedMetrics)
      .join(
        (enter: any) => enter.append('line'),
        (update: any) => update,
        (exit: any) => exit,
      )
      .attr('x1', this.center.cx)
      .attr('y1', this.center.cy)
      .attr('x2', (d: string, i: number) => this.rotate(
        { x: this.center.cx, y: this.center.cy - this.center.r },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).x)
      .attr('y2', (d: string, i: number) => this.rotate(
        { x: this.center.cx, y: this.center.cy - this.center.r },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).y)
      .attr('stroke-width', 1)
      .attr('stroke', 'silver');

    const texts = this.radarChartSVG.svg.append('g').attr('class', 'textList');

    texts
      .selectAll('text')
      .data(this.$store.state.selectedMetrics)
      .join(
        (enter: any) => enter.append('text'),
        (update: any) => update,
        (exit: any) => exit,
      )
      .text((d: string) => d)
      .attr('text-anchor', 'middle')
      .attr('fill', '#555')
      .attr('font-size', '10px')
      .attr('x', (d: string, i: number) => this.rotate(
        { x: this.center.cx, y: this.center.cy - this.center.r },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).x)
      .attr('y', (d: string, i: number) => this.rotate(
        { x: this.center.cx, y: this.center.cy - this.center.r },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).y)
      .attr('dy', '-0.35em')
      .attr('transform', (d: string, i: number) => {
        const point = this.rotate(
          { x: this.center.cx, y: this.center.cy - this.center.r },
          { x: this.center.cx, y: this.center.cy },
          i * (360 / this.$store.state.selectedMetrics.length),
        );
        return `translate(${point.x}, ${point.y})
        rotate(${i * (360 / this.$store.state.selectedMetrics.length)})
        translate(${-point.x}, ${-point.y})`;
      });

    // Append Total Dots
    this.radarChartSVG.svg.append('g').attr('class', 'dots totalDots');

    // Append Total Path
    this.radarChartSVG.svg.append('g').attr('class', 'radarPath totalPath');

    // Append Total Dots
    this.radarChartSVG.svg.append('g').attr('class', 'dots focusedDots');

    // Append Total Path
    this.radarChartSVG.svg.append('g').attr('class', 'radarPath focusedPath');

    innerCircles
      .selectAll('circle')
      .data(this.innerCircles)
      .join(
        (enter: any) => enter
          .append('circle'),
        (update: any) => update,
        (exit: any) => exit,
      )
      .attr('cx', (d: any) => d.cx)
      .attr('cy', (d: any) => d.cy)
      .attr('r', (d: any) => d.r)
      .attr('fill', 'none')
      .attr('stroke', 'silver')
      .attr('stroke-dasharray', ('3 3'));
    this.updateItem();
  }

  private rotate(point: { x: number; y: number }, center: { x: number; y: number }, angle: number) {
    const moved = {
      x: point.x - center.x,
      y: point.y - center.y,
    };
    const cw = (angle * Math.PI) / 180;
    return {
      x: Math.cos(cw) * moved.x - Math.sin(cw) * moved.y + center.x,
      y: Math.sin(cw) * moved.x + Math.cos(cw) * moved.y + center.y,
    };
  }

  // eslint-disable-next-line consistent-return
  private getAvg = (data: any) => _.mergeWith({}, ...data, (a: any, b: any) => {
    if (_.isNumber(b)) {
      return +((((b || 0) / data.length) + (_.isNumber(a) ? (a || 0) : 0)).toFixed(2));
    }
  });
}
