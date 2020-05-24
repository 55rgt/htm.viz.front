import { Vue, Component } from 'vue-property-decorator';
import * as d3 from 'd3';
import { eventBus } from '@/utils/event-bus';
import { SVG } from '@/interface/interface';
import _ from 'lodash';

@Component({})
export default class SubGraph extends Vue {
  private subGraphSVG!: SVG;

  private x: any = null;

  private y: any = null;

  private xAxis: any = null;

  private yAxis: any = null;

  private clip: any = null;

  private scatter: any = null;

  private data: {
    x: number;
    y: number;
  }[] = [];

  private margin = {
    top: 20, right: 30, bottom: 20, left: 30,
  };

  public $refs!: {
    subGraph: HTMLElement;
  };

  created() {
    eventBus.$on('updateSubGraph', () => {
      console.log('update Sub Graph');
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

  private generateData() {
    return _.times(100, () => ({
      x: Math.random() * 4 + 4,
      y: Math.random() * 9,
    }));
  }

  private remove() {
    d3.select(`#${this.subGraphSVG.svgID}`).remove();
    console.log(this.subGraphSVG);
  }

  private updateChart() {
    const newX = d3.event.transform.rescaleX(this.x);
    const newY = d3.event.transform.rescaleY(this.y);

    this.xAxis.call(d3.axisBottom(newX));
    this.yAxis.call(d3.axisLeft(newY));

    this.scatter
      .selectAll('circle')
      .attr('cx', (d: { x: number; y: number }) => newX(d.x))
      .attr('cy', (d: { x: number; y: number }) => newY(d.y));
  }

  private drawElements() {
    this.data = this.generateData();

    const svg = d3.select('#subGraphID')
      .append('svg')
      .attr('id', this.subGraphSVG.svgID)
      .attr('width', this.subGraphSVG.width + this.margin.left + this.margin.right)
      .attr('height', this.subGraphSVG.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.x = d3.scaleLinear()
      // @ts-ignore
      .domain([4, 8])
      .range([0, this.subGraphSVG.width]);

    this.xAxis = svg.append('g')
      .attr('transform',
        `translate(0,${this.subGraphSVG.height})`)
      .call(d3.axisBottom(this.x));

    this.y = d3.scaleLinear()
      .domain([0, 9])
      .range([this.subGraphSVG.height, 0]);

    this.yAxis = svg.append('g')
      .call(d3.axisLeft(this.y));

    this.clip = svg.append('defs').append('SVG:clipPath')
      .attr('id', 'clip')
      .append('SVG:rect')
      .attr('width', this.subGraphSVG.width)
      .attr('height', this.subGraphSVG.height)
      .attr('x', 0)
      .attr('y', 0);

    this.scatter = svg.append('g')
      .attr('clip-path', 'url(#clip)');

    this.scatter
      .selectAll('circle')
      .data(this.data)
      .enter()
      .append('circle')
      .attr('cx', (d: { x: number; y: number }) => this.x(d.x))
      .attr('cy', (d: { x: number; y: number }) => this.y(d.y))
      .attr('r', 4)
      .attr('fill', '#61a3a9')
      .attr('opacity', 0.5);

    const zoom = d3.zoom()
      .scaleExtent([0.5, 1])
      .extent([[0, 0], [this.subGraphSVG.width, this.subGraphSVG.height]])
      .on('zoom', this.updateChart);

    svg.append('rect')
      .attr('width', this.subGraphSVG.width)
      .attr('height', this.subGraphSVG.height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      // @ts-ignore
      .call(zoom);
  }
}
