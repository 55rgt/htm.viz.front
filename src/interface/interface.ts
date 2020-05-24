export interface SVG {
  svgID: string;
  width: number;
  height: number;
  svg: any;
}

export interface SubDisplayDaily {
  dayIndex: number;
  date: string;
  metrics: { metric: number; score: number; }[];
}


export interface SubDisplayUnit {
  dayIndexes: number[];
  metrics: { metric: number; score: number; }[];
}
