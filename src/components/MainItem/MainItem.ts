import { Vue, Component, Prop } from 'vue-property-decorator';
import { SVG } from '@/interface/interface';
import _ from 'lodash';
import * as d3 from 'd3';

@Component({})
export default class MainItem extends Vue {
  private radarChartSVG!: SVG;

  private circles: {
    circleId: string;
    x: number;
    y: number;
    radius: number;
  }[] = [];

  @Prop(String) private classID!: string;

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

    this.updateData();
  }

  private updateData() {
    const number = Math.floor(Math.random() * 5) + 1;
    this.circles = [];
    for (let i = 0; i <= number; i += 1) {
      const radius = Math.floor(Math.random() * 10) + 5;
      this.circles.push({
        circleId: `circle_${i}`,
        x: Math.floor(Math.random() * (this.radarChartSVG.width - 2 * radius)),
        y: Math.floor(Math.random() * (this.radarChartSVG.height - 2 * radius)),
        radius,
      });
    }
    console.log('update Data');
    this.updateElements();
  }

  private mounted() {
    this.initialize();
    this.remove();
    this.drawElements();
  }

  private remove() {
    d3.select(`#${this.radarChartSVG.svgID}`).remove();
  }

  private updateElements() {
    const t = d3.select(`#${this.classID} > svg`).transition().duration(750);

    d3.select(`#${this.classID} > svg`)
      .selectAll('circle')
      .data(this.circles)
      .join(
        (enter: any) => enter
          .append('circle'),
        (update: any) => update,
        (exit: any) => exit.call((exit: any) => exit.transition(t).remove()),
      )
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', (d: any) => d.radius)
      .attr('fill', '#e1c24f');
  }

  private drawElements() {
    const svg = d3.select(`#${this.classID}`)
      .append('svg')
      .attr('id', this.radarChartSVG.svgID)
      .attr('width', this.radarChartSVG.width)
      .attr('height', this.radarChartSVG.height);
    this.updateElements();
  }
}
