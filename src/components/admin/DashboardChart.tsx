"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#6366f1', '#818cf8'];

export function DashboardChart({ data = [] }: { data?: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No activity data yet</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: 'bold',
              fontFamily: 'var(--font-outfit)'
            }}
          />
          <Bar dataKey="posts" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
