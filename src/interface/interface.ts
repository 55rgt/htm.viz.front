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
  metrics: { metric: number; score: number; }[];
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
  count: number;
  color: string;
  unitIndex: number;
}
