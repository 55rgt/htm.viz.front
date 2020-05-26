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

  private maxUnitScore: number = -1;

  private tempCallSubGraph() {
    eventBus.$emit('updateSubGraph');
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
          .value(),
      }))
      .value();
  }

  private getBarUnit(barIndex: BarIdx) {

    const bar = barIndex === BarIdx.LEFT ? this.bars[BarIdx.LEFT] : this.bars[BarIdx.RIGHT];
    const unit = barIndex === BarIdx.LEFT ? this.units[BarIdx.LEFT] : this.units[BarIdx.RIGHT];

    return _.chain(this.units[barIndex].length)
      .times( (i) => ({
        x: bar.x,
        y: bar.y + i * (bar.height / unit.length),
        width: bar.width,
        height: bar.height / unit.length,
      }))
      .orderBy(['y'], ['asc'])
      .value();
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

    // 하루 단위의 데이터를 dayUnit 별로 묶어서 저장함.
    this.units = [
      this.getUnit(this.dailyLists[BarIdx.LEFT]),
      this.getUnit(this.dailyLists[BarIdx.RIGHT]),
    ];

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

    this.barUnits = [this.getBarUnit(BarIdx.LEFT), this.getBarUnit(BarIdx.RIGHT)];

    // units 돌면서 제일 긴 애 측정하기.
    this.maxUnitScore = _.chain(this.units)
      .flattenDeep()
      .map((d) => _.sumBy(d.metrics, e => e.score))
      .max()
      .value();

    // subDisplayItem 만들기
    this.items = [this.getItem(BarIdx.LEFT), this.getItem(BarIdx.RIGHT)];
  }

  /*
    [item의 업데이트 하는 함수 - 1) sort, 2) select]
    -item을 metricsOrder 대로 정렬
    -for문 돌면서 rank와 isSelected 업데이트 한다.
    -x축 업데이트 .
    [x축 업데이트 하는 방식: unitIndex가 같고, selected 되고, rank가 자기 자신 이하인 애들의 스코어 총합으로 계산하기.
   */

  private getItem(barIndex: BarIdx) {
    return _.chain(this.units[barIndex])
      .map((d) => d.metrics)
      .reduce((result, datum, unitIndex) => {
        const sorted = _.sortBy(datum, (item) => this.$store.state.displayMetric.metricsOrder.indexOf(item.metric));
        _.forEach(sorted, (d, rank) => {
          result.push({
            x: barIndex === BarIdx.LEFT ?
              (this.bars[barIndex].x - 1)
              - (this.bars[BarIdx.LEFT].x - this.options.margin.x / 2)
              * (_.chain(sorted).slice(0, rank + 1).sumBy('score').value() / this.maxUnitScore)
              :
              (this.bars[barIndex].x + this.options.barWidth + 1)
              + (this.bars[BarIdx.LEFT].x - this.options.margin.x / 2)
              * (_.chain(sorted).slice(0, rank).sumBy('score').value() / this.maxUnitScore),
            y: this.barUnits[barIndex][unitIndex].y,
            metric: d.metric,
            rank: rank,
            unitIndex: unitIndex,
            width: d.score * (this.bars[BarIdx.LEFT].x - this.options.margin.x / 2)
            / this.maxUnitScore,
            height: this.barUnits[barIndex][unitIndex].height,
            color: this.$store.state.displayMetric.metricPalette[d.metric],
            isSelected: this.$store.state.displayMetric.selectedMetrics.indexOf(d.metric) !== -1,
            score: d.score,
          });
        });
        return result;
      }, [] as SubDisplayItem[])
      .value();
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

    const leftBarUnits = left.append('g')
      .attr('class', 'leftBar');

    const leftItems = left.append('g')
      .attr('class', 'leftItemList');

    leftItems
      .selectAll('rect')
      .data(this.items[BarIdx.LEFT])
      .join(
        (enter: any) => enter
          .append('rect')
          .attr('class', 'leftItem')
          .attr('x', (d: SubDisplayItem) => d.x)
          .attr('y', (d: SubDisplayItem) => d.y)
          .attr('width', (d: SubDisplayItem) => d.width)
          .attr('height', (d: SubDisplayItem) => d.height)
          .attr('fill', (d: SubDisplayItem) => d.color)
          .attr('fill-opacity', 0.9)
          .attr('stroke', '#fff'),
        (exit: any) => exit
          .on('end', function () {
            // @ts-ignore
            d3.select(this).remove();
          })
      );

    leftBarUnits
      .selectAll('rect')
      .data(this.barUnits[BarIdx.LEFT])
      .join(
        (enter: any) => enter
          .append('rect')
          .attr('class', 'leftBarUnit')
          .attr('x', (d: SubDisplayBarUnit) => d.x)
          .attr('y', (d: SubDisplayBarUnit) => d.y)
          .attr('width', (d: SubDisplayBarUnit) => d.width)
          .attr('height', (d: SubDisplayBarUnit) => d.height)
          .attr('fill', this.bars[BarIdx.LEFT].color)
          .attr('stroke', shadeColor(this.bars[BarIdx.LEFT].color, -40)),
        (exit: any) => exit
          .on('end', function () {
            // @ts-ignore
            d3.select(this).remove();
          })
      );

    d3.selectAll('.leftBarUnit')
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
          that.endDrag(d3.mouse(this), BarIdx.LEFT);
        }));

    const right = svg.append('g')
      .attr('id', 'rightDisplay');

    const rightItems = left.append('g')
      .attr('class', 'rightItemList');

    rightItems
      .selectAll('rect')
      .data(this.items[BarIdx.RIGHT])
      .join(
        (enter: any) => enter
          .append('rect')
          .attr('class', 'rightItem')
          .attr('x', (d: SubDisplayItem) => d.x)
          .attr('y', (d: SubDisplayItem) => d.y)
          .attr('width', (d: SubDisplayItem) => d.width)
          .attr('height', (d: SubDisplayItem) => d.height)
          .attr('fill', (d: SubDisplayItem) => d.color)
          .attr('fill-opacity', 0.9)
          .attr('stroke', '#fff'),
        (exit: any) => exit
          .on('end', function () {
            // @ts-ignore
            d3.select(this).remove();
          })
      );

    const rightBarUnits = right.append('g')
      .attr('class', 'rightBar');

    rightBarUnits
      .selectAll('rect')
      .data(this.barUnits[BarIdx.RIGHT])
      .join(
        (enter: any) => enter
          .append('rect')
          .attr('class', 'rightBarUnit')
          .attr('x', (d: SubDisplayBarUnit) => d.x)
          .attr('y', (d: SubDisplayBarUnit) => d.y)
          .attr('width', (d: SubDisplayBarUnit) => d.width)
          .attr('height', (d: SubDisplayBarUnit) => d.height)
          .attr('fill', this.bars[BarIdx.RIGHT].color)
          .attr('stroke', shadeColor(this.bars[BarIdx.RIGHT].color, -40)),
        (exit: any) => exit
          .on('end', function () {
            // @ts-ignore
            d3.select(this).remove();
          })
      );

    d3.selectAll('.rightBarUnit')
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
          that.endDrag(d3.mouse(this), BarIdx.RIGHT);
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

    this.updateYPosition(barIndex, delta);
  }

  private updateYPosition(moveIndex: BarIdx, delta: number) {
    this.bars[moveIndex].y += delta;
    _.forEach(this.barUnits[moveIndex], (d) => d.y += delta);
    _.forEach(this.items[moveIndex], (d) => d.y += delta);
    const s = (moveIndex === BarIdx.LEFT ? {
      id: '#leftBar',
      unitClass: '.leftBarUnit',
      itemClass: '.leftItem',
    } : {
      id: '#rightBar',
      unitClass: '.rightBarUnit',
      itemClass: '.rightItem',
    });
    d3.select(s.id).attr('y', () => this.bars[moveIndex].y);
    d3.selectAll(s.unitClass).each(function (d: any) {
      d3.select(this).attr('y', d.y);
    });
    d3.selectAll(s.itemClass).each(function (d: any) {
      d3.select(this).attr('y', d.y);
    });
  }

  private endDrag(d: any, barIndex: BarIdx) {
    this.dragObj.isDown = false;
    const obj = {
      moveIdx: barIndex,
      upperIdx: this.bars[BarIdx.LEFT].y < this.bars[BarIdx.RIGHT].y ? BarIdx.LEFT : BarIdx.RIGHT,
      overLapY: this.bars[BarIdx.LEFT].y < this.bars[BarIdx.RIGHT].y ?  this.bars[BarIdx.RIGHT].y : this.bars[BarIdx.LEFT].y,
      unitHeight: this.barUnits[BarIdx.LEFT][0].height,
    };
    const targetUnit = _.find(this.barUnits[obj.upperIdx],(d) => obj.overLapY >= d.y && obj.overLapY <= d.y + d.height);
    const gap = _.isUndefined(targetUnit) ? 0 : targetUnit.y + targetUnit.height - obj.overLapY;
    const sign = [1, 2, 4, 7].includes(4 * (1 - obj.moveIdx) + 2 * (1 - obj.upperIdx) + (gap < obj.unitHeight / 2 ? 1 : 0)) ? -1 : 1;
    const value = (gap < obj.unitHeight / 2 ? gap : obj.unitHeight - gap);
    this.updateYPosition(obj.moveIdx, sign * value);
    // update focused -- 오버랩된 애들 찾아야 함.
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
