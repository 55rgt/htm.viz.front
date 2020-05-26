export interface SVG {
  svgID: string;
  width: number;
  height: number;
  svg: any;
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
  isSelected: boolean;
  metric: number; // 나중에 string 으로 바꿔야 함.
  rank: number; // 가운데로부터 얼마나 가까운지
  unitIndex: number; // y 축 인덱스
  score: number;
  color: string;
}
