import { Component, Prop, Vue } from 'vue-property-decorator';
import { eventBus } from '@/utils/event-bus';
import { Circle, RadarChart, SVG } from '@/interface/interface';
import _ from 'lodash';
import * as d3 from 'd3';
import { shadeColor } from '@/utils/color-controller';

enum DragObject {
  LEFT_CTRL,
  BODY,
  RIGHT_CTRL,
}

@Component({})
export default class MainItem extends Vue {
  private radarChartSVG!: SVG;

  private innerCircles: Circle[] = [];

  private totalUnitRange!: [number, number];

  private focusedUnitRange!: [number, number];

  // 전체기간
  private totalRadarChart: RadarChart[] = [];

  // 선택 기간
  private focusedRadarChart: RadarChart[] = [];

  private lensOption = {
    xRange: [11, 181],
    xThreshold: [11, 181],
    sliderWidth: 5,
    sliderHeight: 20,
    isDown: false,
    px: 0,
    py: 0,
  };

  private center: {
    cx: number;
    cy: number;
    r: number;
  } = {
    cx: 1,
    cy: 1,
    r: 1,
  };

  @Prop(String) private classID!: string;

  @Prop(Number) private idx!: number;

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

    this.center = {
      cx: this.radarChartSVG.width / 2,
      cy: this.radarChartSVG.height / 2 - 15,
      r: this.radarChartSVG.width / 2 - 20,
    };

    this.innerCircles = _.times(4, (idx: number) => ({
      cx: this.center.cx,
      cy: this.center.cy,
      r: ((idx + 1) * this.center.r) / 4,
    }));

    this.lensOption = {
      xRange: [11, 181],
      xThreshold: [11, 181],
      sliderWidth: 5,
      sliderHeight: 20,
      isDown: false,
      px: 0,
      py: 0,
    };

    this.totalUnitRange = [0, this.$store.state.unitData[this.idx].length - 1];
    this.focusedUnitRange = this.totalUnitRange;

    this.totalRadarChart = this.getRadarChartData(this.totalUnitRange);

    this.focusedRadarChart = this.totalRadarChart;
  }

  private getRadarChartData(unitRange: [number, number]) {
    const cloned = _.cloneDeep(this.$store.state.unitData);
    const filtered = _.chain(cloned[this.idx])
      .filter((d) => d.unitIndex >= unitRange[0] && d.unitIndex <= unitRange[1])
      .map((d) => d.metrics)
      .value();

    const distribution: {
      [metric: string]: number;
    } = this.getAvg(filtered);

    // console.log(result);
    // console.log(result2);
    return _.chain(this.$store.state.selectedMetrics)
      .map((d) => {
        if (_.isNil(distribution[d])) {
          return {
            metric: d,
            value: 0,
          };
        }
        return {
          metric: d,
          value: distribution[d],
        };
      })
      .orderBy((d) => this.$store.state.selectedMetrics.indexOf(d.metric), ['asc'])
      .value();
  }

  private mounted() {
    // 버그
    eventBus.$on('updateView', () => {
      this.initialize();
      this.remove();
      this.drawElements();
    });
  }

  private remove() {
    d3.select(`#${this.radarChartSVG.svgID}`).remove();
  }

  private getScoreRatio(key: string, value: number) {
    const metric = this.$store.state.unitMetricPerUnit[key];
    if (_.isNil(metric)) {
      console.error('Error');
      return -1;
    }

    // 이것도 metric[0], [1]이 0이면 없는 것이기 때문에 0을 리턴해야 함.
    if (metric[0] === metric[1]) {
      return (metric[0] === 0 ? 0 : 1);
    }
    return +(((value - metric[0]) / (metric[1] - metric[0])).toFixed(2));
  }

  private updateItem(option: {
    dotSelector: string;
    data: RadarChart[];
    pathSelector: string;
    color: string;
  }) {
    const that = this;
    this.radarChartSVG.svg.select(option.dotSelector)
      .selectAll('circle')
      .data(option.data)
      .join(
        (enter: any) => enter
          .append('circle')
          .attr('cx', this.center.cx)
          .attr('cy', this.center.cy),
        (update: any) => update,
        (exit: any) => exit.call((exit: any) => exit.remove()),
      )
      .on('mouseover', function (d: any) {
        console.log(that.$store.state.unitMetricPerUnit);
        console.log(d);
        // @ts-ignore
        d3.select(this).attr('r', 4);
      })
      .on('mouseout', function (d: any) {
        // @ts-ignore
        d3.select(this).attr('r', 3);
      })
      .transition()
      .duration(300)
      .attr('cx', (d: RadarChart, i: number) => this.rotate(
        {
          x: this.center.cx,
          y: this.center.cy - this.center.r * this.getScoreRatio(d.metric, d.value),
        },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).x)
      .attr('cy', (d: RadarChart, i: number) => this.rotate(
        {
          x: this.center.cx,
          y: this.center.cy - this.center.r * this.getScoreRatio(d.metric, d.value),
        },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).y)
      .attr('r', 3)
      .attr('fill', option.color);

    const pathData = _.map(option.data, (d, i) => {
      const point = this.rotate(
        {
          x: this.center.cx,
          y: this.center.cy - this.center.r * this.getScoreRatio(d.metric, d.value),
        },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      );
      return [point.x, point.y];
    });

    const path = _.reduce(pathData, (result, data, index) => {
      let r = result;
      if (index === 0) {
        r += `M ${data[0]} ${data[1]}`;
      } else if (index === pathData.length - 1) {
        r += `L ${data[0]} ${data[1]}`;
        r += `L ${pathData[0][0]} ${pathData[0][1]}`;
      } else {
        r += `L ${data[0]} ${data[1]}`;
      }
      return r;
    }, '');

    this.radarChartSVG.svg.select(option.pathSelector)
      .selectAll('path')
      .data(pathData)
      .join(
        (enter: any) => enter.append('path'),
        (update: any) => update.transition()
          .duration(300),
        (exit: any) => exit.call((exit: any) => exit.remove()),
      )
      .transition()
      .duration(300)
      .attr('d', path)
      .attr('stroke', option.color)
      .attr('stroke-width', 1.5)
      .attr('fill', option.color)
      .attr('fill-opacity', 0.03);
  }

  private drawElements() {
    const that = this;
    // Append SVG
    this.radarChartSVG.svg = d3.select(`#${this.classID}`)
      .append('svg')
      .attr('id', this.radarChartSVG.svgID)
      .attr('width', this.radarChartSVG.width)
      .attr('height', this.radarChartSVG.height);
    // Append Inner Circles
    const innerCircles = this.radarChartSVG.svg.append('g').attr('class', 'innerCircles');

    // Append Lines
    const lines = this.radarChartSVG.svg.append('g').attr('class', 'lines');

    lines
      .selectAll('line')
      .data(this.$store.state.selectedMetrics)
      .join(
        (enter: any) => enter.append('line'),
        (update: any) => update,
        (exit: any) => exit,
      )
      .attr('x1', this.center.cx)
      .attr('y1', this.center.cy)
      .attr('x2', (d: string, i: number) => this.rotate(
        { x: this.center.cx, y: this.center.cy - this.center.r },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).x)
      .attr('y2', (d: string, i: number) => this.rotate(
        { x: this.center.cx, y: this.center.cy - this.center.r },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).y)
      .attr('stroke-width', 1)
      .attr('stroke', 'silver');

    const texts = this.radarChartSVG.svg.append('g').attr('class', 'textList');

    texts
      .selectAll('text')
      .data(this.$store.state.selectedMetrics)
      .join(
        (enter: any) => enter.append('text'),
        (update: any) => update,
        (exit: any) => exit,
      )
      .text((d: string) => (d.length < 12 ? d : `${d.substring(0, 9)}...`))
      .attr('text-anchor', 'middle')
      .attr('fill', '#555')
      .attr('font-size', '10px')
      .attr('x', (d: string, i: number) => this.rotate(
        { x: this.center.cx, y: this.center.cy - this.center.r },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).x)
      .attr('y', (d: string, i: number) => this.rotate(
        { x: this.center.cx, y: this.center.cy - this.center.r },
        { x: this.center.cx, y: this.center.cy },
        i * (360 / this.$store.state.selectedMetrics.length),
      ).y)
      .attr('dy', '-0.35em')
      .attr('transform', (d: string, i: number) => {
        const point = this.rotate(
          { x: this.center.cx, y: this.center.cy - this.center.r },
          { x: this.center.cx, y: this.center.cy },
          i * (360 / this.$store.state.selectedMetrics.length),
        );
        return `translate(${point.x}, ${point.y})
        rotate(${i * (360 / this.$store.state.selectedMetrics.length)})
        translate(${-point.x}, ${-point.y})`;
      });

    // Append Total Dots
    this.radarChartSVG.svg.append('g').attr('class', 'totalDots');

    // Append Total Path
    this.radarChartSVG.svg.append('g').attr('class', 'totalPath');

    // Append Total Dots
    this.radarChartSVG.svg.append('g').attr('class', 'focusedDots');

    // Append Total Path
    this.radarChartSVG.svg.append('g').attr('class', 'focusedPath');

    const slider = this.radarChartSVG.svg.append('g').attr('class', 'slider');

    slider
      .append('rect')
      .attr('id', `leftRect${this.classID}`)
      .attr('x', 0)
      .attr('y', 203)
      .attr('width', () => this.lensOption.xRange[0])
      .attr('height', () => 10)
      .attr('stroke', 'none')
      .attr('fill', shadeColor('#fbe9c3', -20))
      .attr('fill-opacity', 0.3)
      .attr('stroke-width', 1);

    slider
      .append('rect')
      .attr('id', `centerRect${this.classID}`)
      .attr('x', this.lensOption.xRange[0])
      .attr('y', 203)
      .attr('width', () => 170)
      .attr('height', () => 10)
      .attr('stroke', 'none')
      .attr('fill', shadeColor('#fbe9c3', -20))
      .attr('stroke', shadeColor('#fbe9c3', -30))
      .attr('fill-opacity', 0.3)
      .attr('stroke-width', 1)
      .style('cursor', 'pointer');

    d3.select(`#centerRect${this.classID}`)
      // @ts-ignore
      .call(d3.drag()
        .on('start', function () {
          // @ts-ignore
          that.startDrag(d3.mouse(this));
        })
        .on('drag', function () {
          // @ts-ignore
          that.moveDrag(d3.mouse(this), DragObject.BODY);
        })
        .on('end', function () {
          // @ts-ignore
          that.endDrag(d3.mouse(this));
        }));

    slider
      .append('rect')
      .attr('id', `rightRect${this.classID}`)
      .attr('x', this.lensOption.xRange[1])
      .attr('y', 203)
      .attr('width', () => 192 - this.lensOption.xRange[1])
      .attr('height', () => 10)
      .attr('stroke', 'none')
      .attr('fill', shadeColor('#fbe9c3', -20))
      .attr('fill-opacity', 0.3)
      .attr('stroke-width', 1);

    slider
      .append('rect')
      .attr('id', `l_ctrl${this.classID}`)
      .attr('x', () => this.lensOption.xRange[0] - this.lensOption.sliderWidth / 2)
      .attr('y', () => 198)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('width', () => this.lensOption.sliderWidth)
      .attr('height', () => this.lensOption.sliderHeight)
      .attr('fill', shadeColor('#fbe9c3', -15))
      .attr('stroke', shadeColor('#fbe9c3', -30))
      .attr('stroke-width', 1)
      .style('cursor', 'ew-resize');

    d3.select(`#l_ctrl${this.classID}`)
      // @ts-ignore
      .call(d3.drag()
        .on('start', function () {
          // @ts-ignore
          that.startDrag(d3.mouse(this));
        })
        .on('drag', function () {
          // @ts-ignore
          that.moveDrag(d3.mouse(this), DragObject.LEFT_CTRL);
        })
        .on('end', function () {
          // @ts-ignore
          that.endDrag(d3.mouse(this));
        }));

    slider
      .append('rect')
      .attr('id', `r_ctrl${this.classID}`)
      .attr('x', () => this.lensOption.xRange[1] - this.lensOption.sliderWidth / 2)
      .attr('y', () => 198)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('width', () => this.lensOption.sliderWidth)
      .attr('height', () => this.lensOption.sliderHeight)
      .attr('fill', shadeColor('#fbe9c3', -15))
      .attr('stroke', shadeColor('#fbe9c3', -30))
      .attr('stroke-width', 1)
      .style('cursor', 'ew-resize');

    d3.select(`#r_ctrl${this.classID}`)
      // @ts-ignore
      .call(d3.drag()
        .on('start', function () {
          // @ts-ignore
          that.startDrag(d3.mouse(this));
        })
        .on('drag', function () {
          // @ts-ignore
          that.moveDrag(d3.mouse(this), DragObject.RIGHT_CTRL);
        })
        .on('end', function () {
          // @ts-ignore
          that.endDrag(d3.mouse(this));
        }));

    innerCircles
      .selectAll('circle')
      .data(this.innerCircles)
      .join(
        (enter: any) => enter
          .append('circle'),
        (update: any) => update,
        (exit: any) => exit,
      )
      .attr('cx', (d: any) => d.cx)
      .attr('cy', (d: any) => d.cy)
      .attr('r', (d: any) => d.r)
      .attr('fill', 'none')
      .attr('stroke', 'silver')
      .attr('stroke-dasharray', ('3 3'));

    // update total charts
    this.updateItem({
      dotSelector: '.totalDots',
      data: this.totalRadarChart,
      pathSelector: '.totalPath',
      color: '#e055e0',
    });

    // update focused charts
    this.updateItem({
      dotSelector: '.focusedDots',
      data: this.focusedRadarChart,
      pathSelector: '.focusedPath',
      color: '#559be0',
    });
  }

  private rotate(point: { x: number; y: number }, center: { x: number; y: number }, angle: number) {
    const moved = {
      x: point.x - center.x,
      y: point.y - center.y,
    };
    const cw = (angle * Math.PI) / 180;
    return {
      x: Math.cos(cw) * moved.x - Math.sin(cw) * moved.y + center.x,
      y: Math.sin(cw) * moved.x + Math.cos(cw) * moved.y + center.y,
    };
  }

  // eslint-disable-next-line consistent-return
  private getAvg = (data: any) => _.mergeWith({}, ...data, (a: any, b: any) => {
    if (_.isNumber(b)) {
      return +((((b || 0) / data.length) + (_.isNumber(a) ? (a || 0) : 0)).toFixed(2));
    }
  });

  private startDrag(d: any) {
    this.lensOption.isDown = true;
    this.lensOption.px = d[0];
    this.lensOption.py = d[1];
  }

  private moveDrag(d: any, o: DragObject) {
    const that = this;
    const unitLength = this.$store.state.unitData[this.idx].length;
    const length = that.lensOption.xThreshold[1] - that.lensOption.xThreshold[0];
    const gap = length / (unitLength * 2);
    if (!that.lensOption.isDown) return;
    if (unitLength <= 1) return;
    const delta = d[0] - that.lensOption.px;
    that.lensOption.px = d[0];
    switch (o) {
      case DragObject.BODY:
        if (!(that.lensOption.xRange[0] + delta < that.lensOption.xThreshold[0] ||
        that.lensOption.xRange[1] + delta > that.lensOption.xThreshold[1])) {
          that.lensOption.xRange[0] += delta;
          that.lensOption.xRange[1] += delta;
        }
        break;
      case DragObject.LEFT_CTRL:
        if (that.lensOption.xRange[0] + delta >= that.lensOption.xThreshold[0] &&
        that.lensOption.xRange[0] + delta <= that.lensOption.xRange[1] - 2 * gap) {
          that.lensOption.xRange[0] += delta;
        }
        // 왼쪽 올린게 바운더리에 안 겹치고, 걔가 오른쪽 애보다 값이 작아야 함.
        break;
      case DragObject.RIGHT_CTRL:
        if (that.lensOption.xRange[1] + delta <= that.lensOption.xThreshold[1] &&
          that.lensOption.xRange[1] + delta >= that.lensOption.xRange[0] + 2 * gap) {
          that.lensOption.xRange[1] += delta;
        }
        break;
      default:
        break;
    }
    // 데이터 업데이트는 단위 별 보정이 들어가야 한다.
    d3.select(`#leftRect${this.classID}`)
      .attr('width', () => that.lensOption.xRange[0]);

    d3.select(`#centerRect${this.classID}`)
      .attr('x', () => that.lensOption.xRange[0])
      .attr('width', () => that.lensOption.xRange[1] - that.lensOption.xRange[0]);

    d3.select(`#rightRect${this.classID}`)
      .attr('x', () => that.lensOption.xRange[1])
      .attr('width', () => 192 - that.lensOption.xRange[1]);

    d3.select(`#l_ctrl${this.classID}`)
      .attr('x', () => this.lensOption.xRange[0] - this.lensOption.sliderWidth / 2);

    d3.select(`#r_ctrl${this.classID}`)
      .attr('x', () => this.lensOption.xRange[1] - this.lensOption.sliderWidth / 2);

    const positions: number[] = _.times(unitLength,
      (i: number) => gap + i * (length / unitLength) + this.lensOption.xThreshold[0]);

    const newFocusedUnitRange: [number, number] = [
      _.findIndex(positions,
        (d: number) => d > this.lensOption.xRange[0] && d <= this.lensOption.xRange[1]),
      _.findLastIndex(positions,
        (d: number) => d > this.lensOption.xRange[0] && d <= this.lensOption.xRange[1]),
    ];

    if (newFocusedUnitRange[0] !== this.focusedUnitRange[0] ||
    newFocusedUnitRange[1] !== this.focusedUnitRange[1]) {
      this.focusedUnitRange = newFocusedUnitRange;
      this.focusedRadarChart = this.getRadarChartData(this.focusedUnitRange);
      console.log(this.focusedUnitRange);
      // update focused charts
      this.updateItem({
        dotSelector: '.focusedDots',
        data: this.focusedRadarChart,
        pathSelector: '.focusedPath',
        color: '#559be0',
      });
    }
  }

  private endDrag(d: any) {
    const that = this;
    this.lensOption.isDown = false;
    const unitLength = this.$store.state.unitData[this.idx].length;
    const length = that.lensOption.xThreshold[1] - that.lensOption.xThreshold[0];
    const gap = length / (unitLength * 2);
    const centerPosition = this.lensOption.xThreshold[0] + (_.sum(this.focusedUnitRange) + 1) * gap;
    const indexGap = this.focusedUnitRange[1] - this.focusedUnitRange[0];
    this.lensOption.xRange = [
      centerPosition - (indexGap + 1) * gap,
      centerPosition + (indexGap + 1) * gap,
    ];

    d3.select(`#leftRect${this.classID}`)
      .attr('width', () => that.lensOption.xRange[0]);

    d3.select(`#centerRect${this.classID}`)
      .attr('x', () => that.lensOption.xRange[0])
      .attr('width', () => that.lensOption.xRange[1] - that.lensOption.xRange[0]);

    d3.select(`#rightRect${this.classID}`)
      .attr('x', () => that.lensOption.xRange[1])
      .attr('width', () => 192 - that.lensOption.xRange[1]);

    d3.select(`#l_ctrl${this.classID}`)
      .attr('x', () => this.lensOption.xRange[0] - this.lensOption.sliderWidth / 2);

    d3.select(`#r_ctrl${this.classID}`)
      .attr('x', () => this.lensOption.xRange[1] - this.lensOption.sliderWidth / 2);

    console.log(this.focusedUnitRange);
  }
}
