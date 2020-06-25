import { Vue, Component } from 'vue-property-decorator';
import * as d3 from 'd3';
import { eventBus } from '@/utils/event-bus';
import { FocusedItem, SVG } from '@/interface/interface';
import _ from 'lodash';

@Component({})
export default class SubGraph extends Vue {
  private subGraphSVG!: SVG;

  private x: any = null;

  private y: any = null;

  private line: any = null;

  private xAxis: any = null;

  private yAxis: any = null;

  private clip: any = null;

  private scatter: any = null;

  private data: FocusedItem[] = [];

  private margin = {
    top: 20, right: 30, bottom: 20, left: 30,
  };

  public $refs!: {
    subGraph: HTMLElement;
  };

  mounted() {
    eventBus.$on('updateSubGraph', (d: FocusedItem[]) => {
      this.data = d;
      this.initialize();
      this.remove();
      this.drawElements();
    });
  }

  private initialize() {
    this.subGraphSVG = {
      svgID: 'svgSubGraphID',
      width: this.$refs.subGraph.offsetWidth - this.margin.left - this.margin.right,
      height: this.$refs.subGraph.offsetHeight - this.margin.top - this.margin.bottom,
      svg: null,
    };
  }

  private remove() {
    d3.select(`#${this.subGraphSVG.svgID}`).remove();
  }

  private updateChart() {
    const newX = d3.event.transform.rescaleX(this.x);
    const newY = d3.event.transform.rescaleY(this.y);
    const newLine = d3.line()
      .x((d: any) => newX(d.date))
      .y((d: any) => newY(d.value));

    this.xAxis.call(d3.axisBottom(newX));
    this.yAxis.call(d3.axisLeft(newY));

    this.scatter
      .selectAll('circle')
      .attr('cx', (d: any) => newX(d.date))
      .attr('cy', (d: any) => newY(d.value));

    this.scatter
      .selectAll('path')
      .attr('d', (d: any) => newLine(d.values));
  }

  private drawElements() {
    const that = this;
    this.subGraphSVG.svg = d3.select('#subGraphID')
      .append('svg')
      .attr('id', this.subGraphSVG.svgID)
      .attr('width', this.subGraphSVG.width + this.margin.left + this.margin.right)
      .attr('height', this.subGraphSVG.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    const dates = _.chain(this.data)
      .map((d: FocusedItem) => d.values)
      .flatten()
      .map((d) => d.date)
      .value();

    const values = _.chain(this.data)
      .map((d: FocusedItem) => d.values)
      .flatten()
      .map((d) => d.value)
      .value();

    // console.log(values);

    this.x = d3.scaleTime()
      // @ts-ignore
      .domain(d3.extent(dates))
      .range([0, this.subGraphSVG.width]);

    this.xAxis = this.subGraphSVG.svg.append('g')
      .attr('transform',
        `translate(0,${this.subGraphSVG.height})`)
      .attr('font-size', 30)
      .call(d3.axisBottom(this.x));

    this.y = d3.scaleLinear()
      // @ts-ignore
      .domain([0, d3.max(values)])
      .range([this.subGraphSVG.height, 0]);

    this.yAxis = this.subGraphSVG.svg.append('g')
      .call(d3.axisLeft(this.y));

    this.line = d3.line()
      .x((d: any) => that.x(d.date))
      .y((d: any) => that.y(d.value));

    this.clip = this.subGraphSVG.svg.append('defs').append('SVG:clipPath')
      .attr('id', 'clip')
      .append('SVG:rect')
      .attr('width', this.subGraphSVG.width)
      .attr('height', this.subGraphSVG.height)
      .attr('x', 0)
      .attr('y', 0);

    this.scatter = this.subGraphSVG.svg.append('g')
      .attr('clip-path', 'url(#clip)');

    const lines = this.scatter.append('g').attr('class', 'lines');

    const firstDots = this.scatter.append('g').attr('class', 'dots');

    const secondDots = this.scatter.append('g').attr('class', 'dots');

    lines
      .selectAll('path')
      .data(this.data)
      .join(
        (enter: any) => enter.append('path'),
        (update: any) => update.transition()
          .duration(300),
        (exit: any) => exit.call((exit: any) => exit.remove()),
      )
      .transition()
      .duration(300)
      .attr('d', (d: FocusedItem) => this.line(d.values))
      .attr('stroke', (d: FocusedItem, i: number) => (i === 0 ? '#ffa2e9' : '#93e285'))
      .style('stroke-width', 6)
      .style('fill', 'none');

    firstDots
      .selectAll('circle')
      .data(this.data[0].values)
      .join(
        (enter: any) => enter.append('circle'),
        (update: any) => update.transition()
          .duration(300),
        (exit: any) => exit.call((exit: any) => exit.remove()),
      )
      .transition()
      .duration(300)
      // @ts-ignore
      .attr('cx', (d: any) => this.x(d.date))
      // @ts-ignore
      .attr('cy', (d: any) => this.y(d.value))
      .attr('r', 3)
      .attr('fill', '#ffa2e9')
      .attr('opacity', 0.5);

    secondDots
      .selectAll('circle')
      .data(this.data[1].values)
      .join(
        (enter: any) => enter.append('circle'),
        (update: any) => update.transition()
          .duration(300),
        (exit: any) => exit.call((exit: any) => exit.remove()),
      )
      .transition()
      .duration(300)
      // @ts-ignore
      .attr('cx', (d: any) => this.x(d.date))
      // @ts-ignore
      .attr('cy', (d: any) => this.y(d.value))
      .attr('r', 3)
      .attr('fill', '#93e285')
      .attr('opacity', 0.5);

    //
    // this.scatter
    //   .selectAll('circle')
    //   .data(this.data)
    //   .enter()
    //   .append('circle')
    //   .attr('cx', (d: { x: number; y: number }) => this.x(d.x))
    //   .attr('cy', (d: { x: number; y: number }) => this.y(d.y))
    //   .attr('r', 4)
    //   .attr('fill', '#61a3a9')
    //   .attr('opacity', 0.5);
    //
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .extent([[0, 0], [this.subGraphSVG.width, this.subGraphSVG.height]])
      .on('zoom', this.updateChart);

    this.subGraphSVG.svg.append('rect')
      .attr('width', this.subGraphSVG.width)
      .attr('height', this.subGraphSVG.height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      // @ts-ignore
      .call(zoom);
  }
}
