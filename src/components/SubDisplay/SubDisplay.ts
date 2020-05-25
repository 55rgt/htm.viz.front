/* eslint-disable */
import { Vue, Component } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
import { shadeColor } from '@/utils/color-controller';
import getDaily from '@/utils/data-generator';
import {
  SubDisplayDaily, SubDisplayUnit, SubDisplayBar, SVG, SubDisplayBarUnit, SubDisplayItem
} from '@/interface/interface';
import _ from 'lodash';
import * as d3 from 'd3';

enum BarIdx {
  LEFT, RIGHT,
}

@Component({})
export default class SubDisplay extends Vue {
  private subDisplaySVG!: SVG;

  public $refs!: {
    subDisplay: HTMLElement;
  };

  private shadeColor = shadeColor;

  private dragObj = {
    isDown: false,
    py: -1,
  };

  private options = {
    barWidth: 4,
    gap: 90,
    margin: {
      x: 40,
      y: 40,
    },
  };

  private bars!: [SubDisplayBar, SubDisplayBar];

  private dailyLists: [SubDisplayDaily[], SubDisplayDaily[]] = [[], []];

  private units: [SubDisplayUnit[], SubDisplayUnit[]] = [[], []];

  private barUnits: [SubDisplayBarUnit[], SubDisplayBarUnit[]] = [[], []];

  private items: [SubDisplayItem[], SubDisplayItem[]] = [[], []];

  private tempCallSubGraph() {
    eventBus.$emit('updateSubGraph');
    console.log(this.$store.state.displayMetric);
    this.initialize();
    this.remove();
    this.drawElements();
  }

  private getUnit(data: SubDisplayDaily[]) {
    return _.chain(data)
      .orderBy(['dayIndex'], ['asc'])
      .groupBy((d) => Math.floor(d.dayIndex / this.$store.state.dayUnit))
      .map((d: SubDisplayDaily[]) => ({
        dayIndexes: _.map(d, (e: SubDisplayDaily) => e.dayIndex),
        metrics: _.chain({})
          .mergeWith(...(_.map(d, (e: SubDisplayDaily) => e.metrics)),
            (obj: number, src: number) => (_.isNumber(obj) ? obj + src : src))
          .entries()
          .map((k) => ({ metric: +k[0], score: k[1] }))
          // sortBy specific criterion
          .value(),
      }))
      .value();
  }

  private getBarUnit(barIndex: BarIdx) {

    const bar = barIndex === BarIdx.LEFT ? this.bars[BarIdx.LEFT] : this.bars[BarIdx.RIGHT];
    const unit = barIndex === BarIdx.LEFT ? this.units[BarIdx.LEFT] : this.units[BarIdx.RIGHT];

    return _.times(this.units[barIndex].length, (i) => ({
      x: bar.x,
      y: bar.y + i * (bar.height / unit.length),
      width: bar.width,
      height: bar.height / unit.length,
      unitIndex: i,
    }));
  }

  private initialize() {
    this.subDisplaySVG = {
      svgID: 'svgSubDisplayID',
      width: this.$refs.subDisplay.offsetWidth,
      height: this.$refs.subDisplay.offsetHeight,
      svg: null,
    };

    // 하루 단위로 랜덤 데이터를 생성함. 이후에 진짜 데이터로 갈아끼움
    this.dailyLists = [
      getDaily([5, 10], [10, 20]),
      getDaily([5, 10], [10, 20]),
    ];
    console.log(this.dailyLists);

    // 하루 단위의 데이터를 dayUnit 별로 묶어서 저장함.
    this.units = [
      this.getUnit(this.dailyLists[BarIdx.LEFT]),
      this.getUnit(this.dailyLists[BarIdx.RIGHT]),
    ];
    console.log(this.units);

    this.bars = [{
      x: (this.subDisplaySVG.width - this.options.gap - this.options.barWidth) / 2,
      y: this.options.margin.y / 2,
      width: this.options.barWidth,
      height: (this.units[BarIdx.LEFT].length
        * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.units[BarIdx.LEFT].length + this.units[BarIdx.RIGHT].length),
      color: '#bed7b2',
    }, {
      x: (this.subDisplaySVG.width + this.options.gap - this.options.barWidth) / 2,
      y: (this.units[BarIdx.LEFT].length * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.units[BarIdx.LEFT].length + this.units[BarIdx.RIGHT].length) + this.options.margin.y / 2,
      width: this.options.barWidth,
      height: (this.units[BarIdx.RIGHT].length
        * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.units[BarIdx.LEFT].length + this.units[BarIdx.RIGHT].length),
      color: '#edb6d3',
    }];

    this.barUnits = [
      this.getBarUnit(BarIdx.LEFT),
      this.getBarUnit(BarIdx.RIGHT),
    ];

    console.log(this.barUnits);

    // units 돌면서 제일 긴 애 측정하기.

    // subDisplayItem 만들기
  }

  private remove() {
    d3.select(`#${this.subDisplaySVG.svgID}`).remove();
  }

  private drawElements() {
    const that = this;
    const svg = d3.select('#subDisplayID')
      .append('svg')
      .attr('id', this.subDisplaySVG.svgID)
      .attr('width', this.subDisplaySVG.width)
      .attr('height', this.subDisplaySVG.height);

    const left = svg.append('g')
      .attr('id', 'leftDisplay');

    const leftBar = left.append('g');

    leftBar.append('rect')
      .attr('id', 'leftBar')
      .attr('x', this.bars[BarIdx.LEFT].x)
      .attr('y', this.bars[BarIdx.LEFT].y)
      .attr('width', this.bars[BarIdx.LEFT].width)
      .attr('height', this.bars[BarIdx.LEFT].height)
      .attr('fill', this.bars[BarIdx.LEFT].color);

    d3.select('#leftBar')
      // @ts-ignore
      .call(d3.drag()
        .on('start', function () {
          // @ts-ignore
          that.startDrag(d3.mouse(this));
        })
        .on('drag', function () {
          // @ts-ignore
          that.moveDrag(d3.mouse(this), BarIdx.LEFT);
        })
        .on('end', function () {
          // @ts-ignore
          that.endDrag(d3.mouse(this));
        }));

    const right = svg.append('g')
      .attr('id', 'rightDisplay');

    const rightBar = right.append('g');

    rightBar.append('rect')
      .attr('id', 'rightBar')
      .attr('x', this.bars[BarIdx.RIGHT].x)
      .attr('y', this.bars[BarIdx.RIGHT].y)
      .attr('width', this.bars[BarIdx.RIGHT].width)
      .attr('height', this.bars[BarIdx.RIGHT].height)
      .attr('fill', this.bars[BarIdx.RIGHT].color);

    d3.select('#rightBar')
      // @ts-ignore
      .call(d3.drag()
        .on('start', function () {
          // @ts-ignore
          that.startDrag(d3.mouse(this));
        })
        .on('drag', function () {
          // @ts-ignore
          that.moveDrag(d3.mouse(this), BarIdx.RIGHT);
        })
        .on('end', function () {
          // @ts-ignore
          that.endDrag(d3.mouse(this));
        }));
  }

  private startDrag(d: any) {
    this.dragObj.isDown = true;
    this.dragObj.py = d[1];
  }

  private moveDrag(d: any, barIndex: BarIdx) {
    if (!this.dragObj.isDown) return;
    const delta = d[1] - this.dragObj.py;
    this.dragObj.py = d[1];

    if (this.bars[barIndex].y + delta < this.options.margin.y / 2
    || this.bars[barIndex].y + this.bars[barIndex].height + delta
      > this.subDisplaySVG.height - this.options.margin.y / 2) return;

    let id = '';
    this.bars[barIndex].y += delta;
    barIndex === 0 ? id = '#leftBar' : id = '#rightBar';
    d3.select(id).attr('y', () => this.bars[barIndex].y);

  }

  private endDrag(d: any) {
    this.dragObj.isDown = false;
  }

  private isFocused(idx: number) {
    return idx === this.$store.state.displayMetric.focusedMetricIdx;
  }

  private isSelected(idx: number) {
    return this.$store.state.displayMetric.selectedMetrics.includes(idx);
  }

  private getMetricPalette(idx: number) {
    return this.$store.state.displayMetric.metricPalette[idx];
  }

  private changeFocusedMetric(idx: number) {
    this.$store.state.displayMetric.focusedMetricIdx = idx;
  }

  private changeSelectedMetrics(idx: number) {
    if (this.isSelected(idx)) {
      this.$store.state.displayMetric.selectedMetrics
        = _.filter(this.$store.state.displayMetric.selectedMetrics, (d) => d !== idx);
    } else {
      this.$store.state.displayMetric.selectedMetrics.push(idx);
    }
  }
}
