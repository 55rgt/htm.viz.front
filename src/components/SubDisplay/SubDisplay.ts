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
      this.updateData(obj);
      this.updateItem();
    });
  }

  private removeItem(o: {
    barSelector: string;
    itemSelector: string;
  }) {
    this.subDisplaySVG.svg.select(o.barSelector).selectAll('*').remove();
    this.subDisplaySVG.svg.select(o.itemSelector).selectAll('*').remove();
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
    console.log('selectedData');
    console.log(this.selectedData);

    this.bars = [{
      x: (this.subDisplaySVG.width - this.options.gap - this.options.barWidth) / 2,
      y: this.options.margin.y / 2,
      width: this.options.barWidth,
      height: (this.selectedData.left.unitData.length
        * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.selectedData.left.unitData.length + this.selectedData.right.unitData.length),
      color: '#bed7b2',
    }, {
      x: (this.subDisplaySVG.width + this.options.gap - this.options.barWidth) / 2,
      y: (this.selectedData.left.unitData.length * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.selectedData.left.unitData.length + this.selectedData.right.unitData.length)
        + this.options.margin.y / 2,
      width: this.options.barWidth,
      height: (this.selectedData.right.unitData.length
        * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.selectedData.left.unitData.length + this.selectedData.right.unitData.length),
      color: '#edb6d3',
    }];

    console.log('bars');
    console.log(this.bars);

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
      this.items = [this.getItem(BarIdx.LEFT), this.getItem(BarIdx.RIGHT)];
    }
    // console.log(this.maxUnitScore);
    // console.log(this.items);
  }

  private getItem(barIndex: BarIdx) {
    const key = barIndex === 0 ? 'left' : 'right';
    const unitData = this.selectedData[key].unitData;
    // console.log('unitData');
    // console.log(unitData);
    // console.log(this.barUnits[barIndex]);
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
    console.log(result);
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
    return cloned;
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
    console.log(this.barUnits);
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
        .attr('fill', this.bars[BarIdx.LEFT].color)
        .attr('stroke', shadeColor(this.bars[BarIdx.LEFT].color, -40));

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
    console.log('startDrag');
  }

  private moveDrag(d: any, barIndex: BarIdx) {
  }

  private updateYPosition(moveIndex: BarIdx, delta: number) {
    // this.bars[moveIndex].y += delta;
    // _.forEach(this.barUnits[moveIndex], (d) => d.y += delta);
    // _.forEach(this.items[moveIndex], (d) => d.y += delta);
    // const s = (moveIndex === BarIdx.LEFT ? {
    //   id: '#leftBar',
    //   unitClass: '.leftBarUnit',
    //   itemClass: '.leftItem',
    // } : {
    //   id: '#rightBar',
    //   unitClass: '.rightBarUnit',
    //   itemClass: '.rightItem',
    // });
    // d3.select(s.id).attr('y', () => this.bars[moveIndex].y);
    // d3.selectAll(s.unitClass).each(function (d: any) {
    //   d3.select(this).attr('y', d.y);
    // });
    // d3.selectAll(s.itemClass).each(function (d: any) {
    //   d3.select(this).attr('y', d.y);
    // });
  }

  private endDrag(d: any, barIndex: BarIdx) {

  }

}
