export interface SVG {
  svgID: string;
  width: number;
  height: number;
  svg: any;
}

export interface Circle {
  cx: number;
  cy: number;
  r: number;
}

export interface SortOptionItem {
  priority: number;
  metric: string;
  order: 'asc' | 'desc';
}

export interface UnitMapData {
  x: number;
  y: number;
  parentID: string;
  unitIndex: number;
  avgScore: number;
  rank: number;
}

export interface FilterOption {
  [metric: string]: [number, number];
}

export interface WeightController {
  [metric: string]: number;
}

export interface RadarChart {
  metric: string;
  value: number;
}

export interface MetricPerUnit {
  [metric: string]: [number, number];
}

export interface BasicObject {
  parentID: string;
  date: string;
  dateIndex: number;
  metrics: {
    [action_type: string]: number;
  };
}

export interface UnitObject {
  parentID: string;
  dateIndexes: number[];
  dates: string[];
  unitIndex: number;
  metrics: {
    [metric: string]: number;
  }
}

export interface SubDisplayDaily {
  dayIndex: number;
  date: string;
  metrics: {
    [metric: number]: number; // 나중에 key 값 string
  };
}

export interface SubDisplayUnit {
  dayIndexes: number[];
  unitIndex: number;
  metrics: { metric: number; score: number; }[];
}

export interface SubDisplayFocusedItem {
  score: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SubDisplayBar extends Rect {
  color: string;
}

export interface SubDisplayBarUnit extends Rect {
  unitIndex: number;
}

export interface SubDisplayItem extends Rect {
  cx: number;
  cy: number;
  metric: string;
  rank: number; // 가운데로부터 얼마나 가까운지
  unitIndex: number; // y 축 인덱스
  score: number;
  color: string;
}

export interface FocusedItem {
  name: string;
  values: {
    date: string;
    value: number;
  }[];
}


