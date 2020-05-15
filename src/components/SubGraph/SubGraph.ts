import { Vue, Component } from 'vue-property-decorator';
import * as d3 from 'd3';
import { eventBus } from '@/utils/event-bus';
import { SVG } from '@/interface/interface';

@Component({})
export default class SubGraph extends Vue {
  private subGraphSVG!: SVG;

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
      width: this.$refs.subGraph.offsetWidth - 2,
      height: this.$refs.subGraph.offsetHeight - 2,
      svg: null,
    };
  }

  private remove() {
    d3.select(`#${this.subGraphSVG.svgID}`).remove();
    console.log(this.subGraphSVG);
  }

  // private updateData() {
  //
  // }

  private drawElements() {
    this.subGraphSVG.svg = d3
      .select('#subGraphID')
      .append('svg')
      .attr('id', this.subGraphSVG.svgID)
      .attr('width', this.subGraphSVG.width)
      .attr('height', this.subGraphSVG.height);
  }
}
