/* eslint-disable */
import { Vue, Component } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
import { shadeColor } from '@/utils/color-controller';
import {
  SubDisplayDaily, SubDisplayUnit, SubDisplayBar, SVG, SubDisplayBarUnit, SubDisplayItem,
  SubDisplayFocusedItem, UnitObject, BasicObject,
} from '@/interface/interface';
import _ from 'lodash';
import * as d3 from 'd3';
import {makeGradient} from "@/utils/color-gradient";
// import tinygradient from 'tinygradient';

type Keys = 'left' | 'right';

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

  private maxUnitScore: number = -1;

  private textDetail: {
    name: string;
    time: string;
    avgScore: string;
  }[] = [{
    name: '',
    time: '',
    avgScore: '',
  },{
    name: '',
    time: '',
    avgScore: '',
  }];

  private selectedData: {
    [K in Keys] : {
      parentID: string;
      dailyData: any;
      unitData: any;
    };
  } = {
    left: {
      parentID: '',
      dailyData: [],
      unitData: [],
    },
    right: {
      parentID: '',
      dailyData: [],
      unitData: [],
    },
  };

  private bars!: [SubDisplayBar, SubDisplayBar];

  private barUnits!: [SubDisplayBarUnit[], SubDisplayBarUnit[]];

  private items: [SubDisplayItem[], SubDisplayItem[]] = [[], []];

  private overlap: [number, number] = [0, 0];

  private uw: number = 1;


  private dragObj = {
    isDown: false,
    py: -1,
  };

  private options = {
    barWidth: 4,
    focusGap: 80,
    gap: 90,
    margin: {
      x: 40,
      y: 40,
    },
  };

  private created() {
    eventBus.$on('updateView', () => {
      this.initialize();
      this.remove();
      this.drawElements();
    });
    eventBus.$on('updateSubDisplay', (obj: {
      data: UnitObject[],
      index: number,
      parentID: string,
    }) => {
      if (this.selectedData.left.parentID !== '' && this.selectedData.right.parentID !== '' &&
        this.selectedData.left.parentID !== obj.parentID &&
        this.selectedData.right.parentID !== obj.parentID) return;
      this.updateData(obj);
      this.updateItem();
    });
  }
  // private getRGBGradientColor(stop: { color: string; pos: number; }[], step: number, index: number) {
  //   const gradient = tinygradient(stop);
  //   const colors = gradient.rgb(step);
  //   return colors[index];
  // }

  private removeItem(o: {
    barSelector: string;
    itemSelector: string;
  }) {
    this.subDisplaySVG.svg.select('#focusedItemList').selectAll('*').remove();
    this.subDisplaySVG.svg.select(o.barSelector).selectAll('*').remove();
    this.subDisplaySVG.svg.select(o.itemSelector).selectAll('*').remove();
  }

  private getText() {
    console.log('getText');
    if (this.selectedData.left.parentID === '') {
      this.textDetail[0] = {
        name: '',
        time: '',
        avgScore: '',
      };
    } else {
      this.textDetail[0] = {
        name: `Name: ${this.selectedData.left.parentID}`,
        time: `Time: ${this.selectedData.left.dailyData[0].date} ~ ${this.selectedData.left.dailyData[this.selectedData.left.dailyData.length - 1].date}`,
        avgScore: `Avg Score: 0.37`,
      }
    }
    if (this.selectedData.right.parentID === '') {
      this.textDetail[1] = {
        name: '',
        time: '',
        avgScore: '',
      };
    } else {
      this.textDetail[1] = {
        name: `Name: ${this.selectedData.right.parentID}`,
        time: `Time: ${this.selectedData.right.dailyData[0].date} ~ ${this.selectedData.right.dailyData[this.selectedData.right.dailyData.length - 1].date}`,
        avgScore: `Avg Score: 0.37`,
      }
    }
    console.log('this.textDetail', this.textDetail);
    // TODO rendered by force
    this.$forceUpdate();
  }

  private updateData(obj: {
    data: UnitObject[],
    index: number,
    parentID: string,
  }) {
    const left = this.selectedData.left.parentID;
    const right = this.selectedData.right.parentID;
    if ([left, right].includes(obj.parentID)) {
      console.log('already Includes');
      const key = this.selectedData.left.parentID === obj.parentID ? 'left' : 'right';
      const keyIdx = this.selectedData.left.parentID === obj.parentID ? BarIdx.LEFT : BarIdx.RIGHT;
      this.selectedData[key] = {
        parentID: '',
        dailyData: [],
        unitData: [],
      };
      this.items[keyIdx] = [];
      this.removeItem({
        barSelector: keyIdx === BarIdx.LEFT ? '.leftBar' : '.rightBar',
        itemSelector: keyIdx === BarIdx.LEFT ? '.leftItemList' : '.rightItemList',
      })
    } else {
      if (this.selectedData.left.parentID === '') {
        this.selectedData.left = {
          parentID: obj.parentID,
          dailyData: this.getDaily(obj.parentID),
          unitData: this.getUnit(obj.data),
        };
      } else if (this.selectedData.right.parentID === '') {
        this.selectedData.right = {
          parentID: obj.parentID,
          dailyData: this.getDaily(obj.parentID),
          unitData: this.getUnit(obj.data),
        }
      }
    }
    this.getText();
    console.log('selectedData');
    console.log(this.selectedData);

    this.overlap = [0, 0];

    this.bars = [{
      x: (this.subDisplaySVG.width - this.options.gap - this.options.barWidth) / 2,
      y: this.options.margin.y / 2,
      width: this.options.barWidth,
      height: (this.selectedData.left.unitData.length
        * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.selectedData.left.unitData.length + this.selectedData.right.unitData.length),
      color: '#ffa2e9',
    }, {
      x: (this.subDisplaySVG.width + this.options.gap - this.options.barWidth) / 2,
      y: (this.selectedData.left.unitData.length * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.selectedData.left.unitData.length + this.selectedData.right.unitData.length)
        + this.options.margin.y / 2,
      width: this.options.barWidth,
      height: (this.selectedData.right.unitData.length
        * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.selectedData.left.unitData.length + this.selectedData.right.unitData.length),
      color: '#93e285',
    }];

    if (this.selectedData.left.parentID === '' && this.selectedData.right.parentID === '') {
      this.maxUnitScore = -1;
      this.items = [[], []];
      this.getBarUnit();
    } else {
      this.maxUnitScore = +((_.chain([this.selectedData.left.unitData, this.selectedData.right.unitData])
        .flatten()
        .map((d: UnitObject) => _.chain(d.metrics).values().sum().value())
        .max()
        // @ts-ignore
        .value()).toFixed(2));
      this.getBarUnit();
      this.items = [this.getItems(BarIdx.LEFT), this.getItems(BarIdx.RIGHT)];
    }
  }

  private getItems(barIndex: BarIdx) {
    const key = barIndex === 0 ? 'left' : 'right';
    const unitData = this.selectedData[key].unitData;
    // @ts-ignore
    const result: SubDisplayItem[] = _.chain(unitData)
      .map((d: UnitObject) => {
        const unitIndex = d.unitIndex;
        const sortedEntries = _.chain(d.metrics)
          .entries()
          .filter((e) => this.$store.state.clickedMetrics.indexOf(e[0]) !== -1)
          // .sort() -> 정렬 기준에 의해 정렬해야 함.
          .value();
        const rank = (str: string) => _.chain(sortedEntries)
          .orderBy((d) => d[1], ['desc'])
          .map((d) => d[0])
          .value()
          .indexOf(str);
        return _.map(sortedEntries, (e: [string, number]) => {
          // 이것도 MAth.max 해서 나중에 고정해줘도 좋을 것 같다.
          this.uw = (this.bars[0].x - 1 - this.options.margin.x / 2) / sortedEntries.length;
          const cx = barIndex === BarIdx.LEFT ?
            (this.bars[barIndex].x - 1) - (rank(e[0]) + 0.5) * this.uw
            : (this.bars[barIndex].x + this.options.barWidth + 1) + (rank(e[0]) + 0.5) * this.uw;
          const hw = ((0.3 / (1 - sortedEntries.length)) * rank(e[0]) + 0.5) * this.uw;
          const height = this.barUnits[barIndex][unitIndex].height;
          const cy = this.barUnits[barIndex][unitIndex].y + 0.5 * height;
          const hh = ((0.3 / (1 - sortedEntries.length)) * rank(e[0]) + 0.5) * height;
          return {
            cx,
            cy,
            x: cx - hw,
            y: cy - hh,
            metric: e[0],
            rank: rank(e[0]),
            unitIndex: unitIndex,
            width: 2 * hw,
            height: 2 * hh,
            color: makeGradient('#e74c30', '#242482', 100, Math.floor(e[1] * 100)),
            /* this.$store.state.displayMetric.selectedMetrics.indexOf(d.metric) !== -1 */
            score: e[1],
          }
        });
      })
      .flatten()
      .value();
    return result;

  }

  private getItem(barIndex: BarIdx) {
    const key = barIndex === 0 ? 'left' : 'right';
    const unitData = this.selectedData[key].unitData;
    // @ts-ignore
    const result: SubDisplayItem[] = _.chain(unitData)
      .map((d: UnitObject) => {
        const unitIndex = d.unitIndex;
        const sortedEntries = _.chain(d.metrics)
          .entries()
          // .sort() -> 정렬 기준에 의해 정렬해야 함 .
          .value();
        return _.map(sortedEntries, (e: [string, number], rank: number) => {
          const selectedSortedEntries = sortedEntries; // 나중에 바꿔야 함.
          return {
            x: barIndex === BarIdx.LEFT ?
              (this.bars[barIndex].x - 1) - (this.bars[BarIdx.LEFT].x - this.options.margin.x / 2)
              * (_.chain(selectedSortedEntries)
                .slice(0, rank + 1)
                .sumBy((d) => d[1])
                .value() / this.maxUnitScore)
              : (this.bars[barIndex].x + this.options.barWidth + 1)
              + (this.bars[BarIdx.LEFT].x - this.options.margin.x / 2)
              * (_.chain(selectedSortedEntries)
                .slice(0, rank)
                .sumBy((d) => d[1])
                .value() / this.maxUnitScore),
            y: this.barUnits[barIndex][unitIndex].y,
            metric: e[0],
            rank: rank,
            unitIndex: unitIndex,
            width: e[1] * (this.bars[BarIdx.LEFT].x - this.options.margin.x / 2) / this.maxUnitScore,
            height: this.barUnits[barIndex][unitIndex].height,
            color: /* 'this.$store.state.displayMetric.metricPalette[d.metric]' */ '#aaa',
            isSelected: true,
            /* this.$store.state.displayMetric.selectedMetrics.indexOf(d.metric) !== -1 */
            score: e[1],
          }
        });
      })
      .flatten()
      .value();
    return result;
  }

  private normalize(range: [number, number], value: number, fp: number) {
    // 둘 다 0이면 0으로 처리해야함
    return range[1] === range[0] ? 1 : +(((value - range[0]) / (range[1] - range[0])).toFixed(fp));
  }

  private getDaily(id: string) {
    return _.chain(this.$store.state.filteredData)
      .filter((d: BasicObject) => d.parentID === id)
      .orderBy(['dateIndex'], ['asc'])
      .value();
  }

  private getUnit(data: UnitObject[]) {
    const cloned = _.cloneDeep(data);
    cloned.forEach((d) => {
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
    });
    return _.orderBy(cloned, ['unitIndex'], ['asc']);
  }

  private getBarUnit() {
    const keys: [Keys, Keys] = ['left', 'right'];
    // @ts-ignore
    this.barUnits = _.chain(keys)
      .map((k, idx) => {
        return _.chain(this.selectedData[k].unitData.length)
          .times((i) => ({
            x: this.bars[idx].x,
            y: this.bars[idx].y + i * (this.bars[idx].height / this.selectedData[k].unitData.length),
            width: this.bars[idx].width,
            height: this.bars[idx].height / this.selectedData[k].unitData.length,
            unitIndex: +i,
          }) as SubDisplayBarUnit)
          .orderBy(['unitIndex'], ['asc'])
          .value();
      })
      .value();
  }

  private initialize() {
    this.subDisplaySVG = {
      svgID: 'svgSubDisplayID',
      width: this.$refs.subDisplay.offsetWidth,
      height: this.$refs.subDisplay.offsetHeight,
      svg: null,
    };

    this.selectedData = {
      left: {
        parentID: '',
        dailyData: [],
        unitData: [],
      },
      right: {
        parentID: '',
        dailyData: [],
        unitData: [],
      },
    };
  }


  private remove() {
    d3.select(`#${this.subDisplaySVG.svgID}`).remove();
  }

  private updateItem() {
    console.log(this.bars);
    if (this.barUnits[BarIdx.LEFT].length !== 0 && this.items[BarIdx.LEFT].length !== 0) {
      this.subDisplaySVG.svg.select('.leftBar')
        .selectAll('rect')
        .data(this.barUnits[BarIdx.LEFT])
        .join(
          (enter: any) => enter
            .append('rect')
            .attr('class', 'leftBarUnit'),
          (update: any) => update,
          (exit: any) => exit.call((exit: any) => exit.remove()),
        )
        .attr('x', (d: SubDisplayBarUnit) => d.x)
        .attr('y', (d: SubDisplayBarUnit) => d.y)
        .attr('width', (d: SubDisplayBarUnit) => d.width)
        .attr('height', (d: SubDisplayBarUnit) => d.height)
        .attr('fill', this.bars[BarIdx.LEFT].color)
        .attr('stroke', shadeColor(this.bars[BarIdx.LEFT].color, -40));
      this.subDisplaySVG.svg.select('.leftItemList')
        .selectAll('rect')
        .data(this.items[BarIdx.LEFT])
        .join(
          (enter: any) => enter
            .append('rect')
            .attr('class', 'leftItem'),
          (update: any) => update,
          (exit: any) => exit.call((exit: any) => exit.remove()),
        )
        .attr('x', (d: SubDisplayItem) => d.x)
        .attr('y', (d: SubDisplayItem) => d.y)
        .attr('width', (d: SubDisplayItem) => d.width)
        .attr('height', (d: SubDisplayItem) => d.height)
        .attr('fill', (d: SubDisplayItem) => d.color)
        .attr('fill-opacity', 0.9)
        .attr('stroke', '#fff')
        .on('click', function a(d: SubDisplayItem) {
          console.log(d);
        });
    }

    if (this.barUnits[BarIdx.RIGHT].length !== 0 && this.items[BarIdx.RIGHT].length !== 0) {
      this.subDisplaySVG.svg.select('.rightBar')
        .selectAll('rect')
        .data(this.barUnits[BarIdx.RIGHT])
        .join(
          (enter: any) => enter
            .append('rect')
            .attr('class', 'rightBarUnit'),
          (update: any) => update,
          (exit: any) => exit.call((exit: any) => exit.remove()),
        )
        .attr('x', (d: SubDisplayBarUnit) => d.x)
        .attr('y', (d: SubDisplayBarUnit) => d.y)
        .attr('width', (d: SubDisplayBarUnit) => d.width)
        .attr('height', (d: SubDisplayBarUnit) => d.height)
        .attr('fill', this.bars[BarIdx.RIGHT].color)
        .attr('stroke', shadeColor(this.bars[BarIdx.RIGHT].color, -40));

      this.subDisplaySVG.svg.select('.rightItemList')
        .selectAll('rect')
        .data(this.items[BarIdx.RIGHT])
        .join(
          (enter: any) => enter
            .append('rect')
            .attr('class', 'rightItem'),
          (update: any) => update,
          (exit: any) => exit.call((exit: any) => exit.remove()),
        )
        .attr('x', (d: SubDisplayItem) => d.x)
        .attr('y', (d: SubDisplayItem) => d.y)
        .attr('width', (d: SubDisplayItem) => d.width)
        .attr('height', (d: SubDisplayItem) => d.height)
        .attr('fill', (d: SubDisplayItem) => d.color)
        .attr('fill-opacity', 0.9)
        .attr('stroke', '#fff')
        .on('click', function a(d: SubDisplayItem) {
          console.log(d);
        });
    }
  }

  private drawElements() {
    const that = this;
    this.subDisplaySVG.svg = d3.select('#subDisplayID')
      .append('svg')
      .attr('id', this.subDisplaySVG.svgID)
      .attr('width', this.subDisplaySVG.width)
      .attr('height', this.subDisplaySVG.height);

    const focused = this.subDisplaySVG.svg.append('g').attr('id', 'focusedItemList');

    const left = this.subDisplaySVG.svg.append('g').attr('id', 'leftDisplay');

    left.append('g').attr('class', 'leftBar');

    left.append('g').attr('class', 'leftItemList');

    const right = this.subDisplaySVG.svg.append('g').attr('id', 'rightDisplay');

    right.append('g').attr('class', 'rightItemList');

    right.append('g').attr('class', 'rightBar');

    d3.selectAll('.leftBar')
      // @ts-ignore
      .call(d3.drag()
        .on('start', function a() {
          // @ts-ignore
          that.startDrag(d3.mouse(this));
        })
        .on('drag', function a() {
          // @ts-ignore
          that.moveDrag(d3.mouse(this), BarIdx.LEFT);
        })
        .on('end', function a() {
          // @ts-ignore
          that.endDrag(d3.mouse(this), BarIdx.LEFT);
        }));

    d3.selectAll('.rightBar')
      // @ts-ignore
      .call(d3.drag()
        .on('start', function a() {
          // @ts-ignore
          that.startDrag(d3.mouse(this));
        })
        .on('drag', function a() {
          // @ts-ignore
          that.moveDrag(d3.mouse(this), BarIdx.RIGHT);
        })
        .on('end', function a() {
          // @ts-ignore
          that.endDrag(d3.mouse(this), BarIdx.RIGHT);
        }));
  }

  private startDrag(d: any) {
    // 하나만 있으면 드래그 안 되게 하기.
    console.log('startDrag');
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

    this.overlap = this.bars[BarIdx.LEFT].y < this.bars[BarIdx.RIGHT].y ?
      [this.bars[BarIdx.RIGHT].y, this.bars[BarIdx.LEFT].y + this.bars[BarIdx.LEFT].height] :
      [this.bars[BarIdx.LEFT].y, this.bars[BarIdx.RIGHT].y + this.bars[BarIdx.RIGHT].height];

    this.updateFocusedItem();
  }

  private updateFocusedItem() {
    // 만약 한쪽이 비어있으면 return;
    const that = this;

    const adjust = (n: number, fp = 2) => Math.floor(n * Math.pow(10, fp)) / Math.pow(10, fp);

    const unitIndexes = _.times(2, (n) => _.chain(this.barUnits[n])
      .filter((d: SubDisplayBarUnit) => adjust(d.y) >= adjust(this.overlap[0]) &&
        adjust(d.y) + adjust(d.height) <= adjust(this.overlap[1]))
      .map(d => d.unitIndex)
      .value());

    const keys: [Keys, Keys] = ['left', 'right'];

    const dayIndexes = _.map(keys, (k: Keys, i: number) => _.chain(this.selectedData[k].unitData)
      .filter((d) => unitIndexes[i].indexOf(d.unitIndex) !== -1)
      .map((d) => d.dateIndexes)
      .flatten()
      .value()
      .sort());

    const focusedItems = _.chain(_.zip(dayIndexes[0], dayIndexes[1]))
      .map((d: [number | undefined, number | undefined]) => _.map(d, (n: number | undefined, i: number) => {
        if (_.isNil(n)) return 0;
        const key: Keys = i === 0 ? 'left' : 'right';
        const datum = _.find(this.selectedData[key]['dailyData'], (o) => o.dateIndex === n);
        return _.isNil(datum.metrics[this.$store.state.focusedMetrics]) ? 0 :
          datum.metrics[this.$store.state.focusedMetrics];
      }))
      .value();

    // @ts-ignore
    const maxDiff: number = _.chain(focusedItems)
      .map((d: [number, number]) => Math.abs(d[0] - d[1]))
      .max()
      .value();

    const height = this.barUnits[BarIdx.LEFT][0].height / this.$store.state.dateUnit;

    this.subDisplaySVG.svg.select('#focusedItemList')
      .selectAll('rect')
      .data(focusedItems)
      .join(
        (enter: any) => enter
          .append('rect')
          .attr('class', 'focusedItem'),
        (update: any) => update,
        (exit: any) => exit.call((exit: any) => exit.remove()),
      )
      .attr('x', (d: [number, number]) => {
        return d[0] < d[1] ? this.subDisplaySVG.width / 2 + 2 :
          this.subDisplaySVG.width / 2 - (this.options.focusGap / 2) *
          Math.abs(d[0] - d[1]) / maxDiff;
      })
      .attr('y', (d: [number, number], i: number) => height * i + this.overlap[0])
      .attr('width', (d: [number, number]) => (this.options.focusGap / 2) *
        Math.abs(d[0] - d[1]) / maxDiff)
      .attr('height', () => height)
      .attr('fill', '#fbe9c3')
      .attr('stroke', shadeColor('#fbe9c3', -20));

    const dates = _.map(keys, (k: Keys, i: number) => _.chain(this.selectedData[k].unitData)
      .filter((d) => unitIndexes[i].indexOf(d.unitIndex) !== -1)
      .map((d) => d.dates)
      .flatten()
      .value()
      .sort());

    const focusedData = _.chain(dates)
      .map((d: string[], i: number) => {
        const key: Keys = i === 0 ? 'left' : 'right';
        const name: string = this.selectedData[key].parentID;
        const values = _.reduce(d, (result, str: string) => {
          const datum = _.find(this.selectedData[key]['dailyData'], (o) => o.date === str);
          result.push({
            date: d3.timeParse('%Y-%m-%d')(datum.date),
            value: _.isNil(datum.metrics[this.$store.state.focusedMetrics]) ? 0 :
              datum.metrics[this.$store.state.focusedMetrics],
          });
          return result;
        }, [] as { date: any; value: number; }[]);
        return {
          name,
          values,
        }
      })
      .value();

    eventBus.$emit('updateSubGraph', focusedData);
  }

}
