import { Vue, Component, Prop } from 'vue-property-decorator';
import { SVG } from '@/interface/interface';
import _ from 'lodash';
import * as d3 from 'd3';

@Component({})
export default class MainItem extends Vue {
  private radarChartSVG!: SVG;

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
  }

  private mounted() {
    console.log(this.$refs.radarChart);
    this.initialize();
    this.remove();
    this.drawElements();
  }

  private remove() {
    d3.select(`#${this.radarChartSVG.svgID}`).remove();
  }

  private drawElements() {
    d3.select(`#${this.classID}`)
      .append('svg')
      .attr('id', this.radarChartSVG.svgID)
      .attr('width', this.radarChartSVG.width)
      .attr('height', this.radarChartSVG.height);
  }
}
