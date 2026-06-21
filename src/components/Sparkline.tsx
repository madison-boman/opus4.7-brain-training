import React from 'react';
import LineChart from './LineChart';

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const Sparkline: React.FC<Props> = ({ data, width = 90, height = 32, color }) => (
  <LineChart data={data} width={width} height={height} color={color} showDots={false} strokeWidth={2} />
);

export default Sparkline;
