import { Vue, Component } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
import { shadeColor } from '@/utils/color-controller';
import getSubDisplayDaily from '@/utils/data-generator';
import { SubDisplayDaily, SubDisplayUnit, SVG } from '@/interface/interface';
import _ from 'lodash';
import * as d3 from 'd3';

@Component({})
export default class SubDisplay extends Vue {
  private subDisplaySVG!: SVG;

  public $refs!: {
    subDisplay: HTMLElement;
  };

  private shadeColor = shadeColor;

  private options = {
    barWidth: 4,
    gap: 90,
    margin: {
      x: 40,
      y: 40,
    },
  };

  private subDisplayDailyLists: [SubDisplayDaily[], SubDisplayDaily[]] = [[], []];

  private tempCallSubGraph() {
    eventBus.$emit('updateSubGraph');
    console.log(this.$store.state.displayMetric);
    this.subDisplayDailyLists = [
      getSubDisplayDaily([5, 10], [10, 20]),
      getSubDisplayDaily([5, 10], [10, 20]),
    ];
    console.log(this.subDisplayDailyLists);
    const tmpData = _.chain(this.subDisplayDailyLists[0])
      .orderBy(['dayIndex'], ['asc'])
      .groupBy((d) => Math.floor(d.dayIndex / this.$store.state.dayUnit))
      .map((d: SubDisplayDaily[]) => _.reduce(d, (result, value) => {
        console.log(value);
        return result;
      }, {
        dayIndexes: [],
        metrics: [],
      } as SubDisplayUnit))
      .value();

    this.initialize();
    this.remove();
    this.drawElements();
  }

  private initialize() {
    this.subDisplaySVG = {
      svgID: 'svgSubDisplayID',
      width: this.$refs.subDisplay.offsetWidth,
      height: this.$refs.subDisplay.offsetHeight,
      svg: null,
    };
  }

  private remove() {
    d3.select(`#${this.subDisplaySVG.svgID}`).remove();
  }

  private getUnitLength() {
    return {
      left: Math.ceil(this.subDisplayDailyLists[0].length / this.$store.state.dayUnit),
      right: Math.ceil(this.subDisplayDailyLists[1].length / this.$store.state.dayUnit),
    };
  }

  private drawElements() {
    const svg = d3.select('#subDisplayID')
      .append('svg')
      .attr('id', this.subDisplaySVG.svgID)
      .attr('width', this.subDisplaySVG.width)
      .attr('height', this.subDisplaySVG.height);

    const left = svg.append('g')
      .attr('id', 'leftDisplay');

    const leftBar = left.append('g')
      .attr('id', 'leftBar');

    leftBar.append('rect')
      .attr('x', (this.subDisplaySVG.width - this.options.gap - this.options.barWidth) / 2)
      .attr('y', this.options.margin.y / 2)
      .attr('width', this.options.barWidth)
      .attr('height', (this.getUnitLength().left
        * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.getUnitLength().left + this.getUnitLength().right))
      .attr('fill', '#bed7b2');

    const right = svg.append('g')
      .attr('id', 'rightDisplay');

    const rightBar = right.append('g')
      .attr('id', 'rightBar');

    rightBar.append('rect')
      .attr('x', (this.subDisplaySVG.width + this.options.gap - this.options.barWidth) / 2)
      .attr('y', (this.getUnitLength().left * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.getUnitLength().left + this.getUnitLength().right) + this.options.margin.y / 2)
      .attr('width', this.options.barWidth)
      .attr('height', (this.getUnitLength().right
        * (this.subDisplaySVG.height - this.options.margin.y))
        / (this.getUnitLength().left + this.getUnitLength().right))
      .attr('fill', '#edb6d3');
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
