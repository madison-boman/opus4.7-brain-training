import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { palette } from '../theme';

interface Props {
  data: number[];
  width: number;
  height: number;
  color?: string;
  fillColor?: string;
  showDots?: boolean;
  strokeWidth?: number;
}

const LineChart: React.FC<Props> = ({
  data,
  width,
  height,
  color = palette.primary,
  fillColor,
  showDots = true,
  strokeWidth = 2.5,
}) => {
  if (data.length === 0) return <View style={{ width, height }} />;
  const padX = 8;
  const padY = 12;
  const w = width - padX * 2;
  const h = height - padY * 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: padX + (data.length === 1 ? w / 2 : (w * i) / (data.length - 1)),
    y: padY + h - ((v - min) / range) * h,
  }));

  let pathData = '';
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (i === 0) {
      pathData += `M ${p.x},${p.y}`;
    } else {
      const prev = points[i - 1];
      const cx1 = (prev.x + p.x) / 2;
      pathData += ` C ${cx1},${prev.y} ${cx1},${p.y} ${p.x},${p.y}`;
    }
  }

  const fillPath = `${pathData} L ${points[points.length - 1].x},${padY + h} L ${points[0].x},${padY + h} Z`;
  const gradId = `g-${color.replace('#', '')}`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={fillColor ?? color} stopOpacity="0.45" />
          <Stop offset="100%" stopColor={fillColor ?? color} stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Path d={fillPath} fill={`url(#${gradId})`} />
      <Path d={pathData} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {showDots &&
        points.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 4 : 2.5}
            fill={color}
            stroke="#0B0B1F"
            strokeWidth={1.5}
          />
        ))}
    </Svg>
  );
};

export default LineChart;
