
import React from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer
} from 'recharts';

const SubjectRadarChart = ({ grades }) => {
  const radarData = grades.map((g: any) => ({ 
    subject: g.subject?.slice(0, 4) || '??',
    score: g.overall || 0,
    fullMark: 100 
  }));

  return (
    <ResponsiveContainer width="100%" height={192}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
        <PolarAngleAxis dataKey="subject" fontSize={10} stroke="hsl(var(--muted-foreground))" />
        <Radar name="Performance" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default React.memo(SubjectRadarChart);
