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

  private selectedData: {
    left: {
      parentID?: string;
      dailyData?: any;
      unitData?: any;
    };
    right: {
      parentID?: string;
      dailyData?: any;
      unitData?: any;
    };
  } = {
    left: {
      dailyData: [],
      unitData: [],
    },
    right: {
      dailyData: [],
      unitData: [],
    },
  };

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
      console.log('update View - sub display');
      this.initialize();
      this.remove();
      // this.drawElements();
    });
    eventBus.$on('updateSubDisplay', (obj: {
      data: UnitObject[],
      index: number,
      parentID: string,
    }) => this.updateData(obj));
  }

  private updateData(obj: {
    data: UnitObject[],
    index: number,
    parentID: string,
  }) {
    const left = _.isEmpty(this.selectedData.left) ? '' : this.selectedData.left.parentID;
    const right = _.isEmpty(this.selectedData.right) ? '' : this.selectedData.right.parentID;
    if ([left, right].includes(obj.parentID)) {
      const key = this.selectedData.left.parentID === obj.parentID ? 'left' : 'right';
      this.selectedData[key] = {
        parentID: '',
        dailyData: [],
        unitData: [],
      };
    } else {
      if (_.isEmpty(this.selectedData.left)) {
        this.selectedData.left = {
          parentID: obj.parentID,
          dailyData: this.getDaily(obj.parentID),
          unitData: this.getUnit(obj.data),
        };
      } else if (_.isEmpty(this.selectedData.right)) {
        this.selectedData.right = {
          parentID: obj.parentID,
          dailyData: this.getDaily(obj.parentID),
          unitData: this.getUnit(obj.data),
        }
      }
    }
    // this.bars = [{
    //   x: (this.subDisplaySVG.width - this.options.gap - this.options.barWidth) / 2,
    //   y: this.options.margin.y / 2,
    //   width: this.options.barWidth,
    //   height: (this.selectedData.left.unitData.length
    //     * (this.subDisplaySVG.height - this.options.margin.y))
    //     / (this.selectedData.left.unitData.length + this.selectedData.right.unitData.length),
    //   color: '#bed7b2',
    // }, {
    //   x: (this.subDisplaySVG.width + this.options.gap - this.options.barWidth) / 2,
    //   y: (this.selectedData.left.unitData.length * (this.subDisplaySVG.height - this.options.margin.y))
    //     / (this.selectedData.left.unitData.length + this.selectedData.right.unitData.length)
    //     + this.options.margin.y / 2,
    //   width: this.options.barWidth,
    //   height: (this.selectedData.right.unitData.length
    //     * (this.subDisplaySVG.height - this.options.margin.y))
    //     / (this.selectedData.left.unitData.length + this.selectedData.right.unitData.length),
    //   color: '#edb6d3',
    // }];
    // console.log(this.bars);
  }


  private getDaily(id: string) {
    return _.chain(this.$store.state.filteredData)
      .filter((d: BasicObject) => d.parentID === id)
      .orderBy(['dateIndex'], ['asc'])
      .value();
  }

  private getUnit(data: UnitObject[]) {
    const cloned = _.cloneDeep(data);
    return [];
  }

  // private getBarUnit(barIndex: BarIdx) {
  //
  //   const bar = barIndex === BarIdx.LEFT ? this.bars[BarIdx.LEFT] : this.bars[BarIdx.RIGHT];
  //   const unit = barIndex === BarIdx.LEFT ? this.units[BarIdx.LEFT] : this.units[BarIdx.RIGHT];
  //
  //   return _.chain(this.units[barIndex].length)
  //     .times( (i) => ({
  //       x: bar.x,
  //       y: bar.y + i * (bar.height / unit.length),
  //       width: bar.width,
  //       height: bar.height / unit.length,
  //       unitIndex: i,
  //     }))
  //     .orderBy(['y'], ['asc'])
  //     .value();
  // }

  private initialize() {
    this.subDisplaySVG = {
      svgID: 'svgSubDisplayID',
      width: this.$refs.subDisplay.offsetWidth,
      height: this.$refs.subDisplay.offsetHeight,
      svg: null,
    };

    this.selectedData = {
      left: {
        dailyData: [],
        unitData: [],
      },
      right: {
        dailyData: [],
        unitData: [],
      },
    };
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
  }

  private startDrag(d: any) {

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
