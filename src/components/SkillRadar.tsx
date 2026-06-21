import React from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient as SvgGradient, Polygon, Stop, Text as SvgText } from 'react-native-svg';
import { SKILL_META, SkillKey } from '../data/games';
import { palette } from '../theme';

interface Props {
  values: Record<SkillKey, number>;
  size?: number;
}

const SKILLS: SkillKey[] = ['memory', 'focus', 'reaction', 'logic', 'problem'];

const SkillRadar: React.FC<Props> = ({ values, size }) => {
  const dim = size ?? Math.min(Dimensions.get('window').width - 80, 280);
  const cx = dim / 2;
  const cy = dim / 2;
  const radius = dim / 2 - 30;

  const angleFor = (i: number) => (Math.PI * 2 * i) / SKILLS.length - Math.PI / 2;

  const ringPoints = (r: number) =>
    SKILLS.map((_, i) => {
      const a = angleFor(i);
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
    }).join(' ');

  const dataPoints = SKILLS.map((s, i) => {
    const a = angleFor(i);
    const norm = Math.max(0.1, Math.min(1, (values[s] - 200) / 1300));
    const r = radius * norm;
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  }).join(' ');

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={dim} height={dim}>
        <Defs>
          <SvgGradient id="gradFill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#22D3EE" stopOpacity="0.4" />
          </SvgGradient>
        </Defs>
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <Polygon
            key={p}
            points={ringPoints(radius * p)}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
        ))}
        {SKILLS.map((s, i) => {
          const a = angleFor(i);
          const lx = cx + Math.cos(a) * radius;
          const ly = cy + Math.sin(a) * radius;
          return <Line key={s} x1={cx} y1={cy} x2={lx} y2={ly} stroke="rgba(255,255,255,0.06)" />;
        })}
        <Polygon
          points={dataPoints}
          fill="url(#gradFill)"
          stroke={palette.primary}
          strokeWidth={2}
        />
        {SKILLS.map((s, i) => {
          const a = angleFor(i);
          const norm = Math.max(0.1, Math.min(1, (values[s] - 200) / 1300));
          const r = radius * norm;
          return (
            <Circle
              key={s + '-pt'}
              cx={cx + Math.cos(a) * r}
              cy={cy + Math.sin(a) * r}
              r={4}
              fill={SKILL_META[s].color}
            />
          );
        })}
        {SKILLS.map((s, i) => {
          const a = angleFor(i);
          const lx = cx + Math.cos(a) * (radius + 18);
          const ly = cy + Math.sin(a) * (radius + 18);
          return (
            <G key={s + '-lbl'}>
              <SvgText
                x={lx}
                y={ly + 4}
                fill={palette.text}
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                {SKILL_META[s].label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

export default SkillRadar;
