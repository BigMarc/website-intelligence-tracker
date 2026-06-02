"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCompactNumber } from "@/lib/utils";

type Point = Record<string, string | number | null>;

export function TrafficSparkline({ data }: { data: Point[] }) {
  return (
    <div className="h-12 w-36">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <AreaChart data={data}>
          <Area type="monotone" dataKey="visits" stroke="#0f9f8f" fill="#0f9f8f" fillOpacity={0.18} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrafficHistoryChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <AreaChart data={data} margin={{ left: 8, right: 8, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatCompactNumber(Number(value))} />
          <Area type="monotone" dataKey="visits" stroke="#0f9f8f" fill="#0f9f8f" fillOpacity={0.2} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RankHistoryChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <LineChart data={data} margin={{ left: 8, right: 8, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis reversed tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="globalRank" stroke="#d97706" strokeWidth={2} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChannelBarChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" unit="%" tick={{ fontSize: 12 }} />
          <YAxis dataKey="channel" type="category" width={110} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
          <Bar dataKey="sharePercent" fill="#2563eb" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonChart({ data, keys }: { data: Point[]; keys: string[] }) {
  const colors = ["#0f9f8f", "#d97706", "#2563eb", "#be123c", "#7c3aed"];
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <LineChart data={data} margin={{ left: 8, right: 8, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatCompactNumber(Number(value))} />
          <Legend />
          {keys.map((key, index) => (
            <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={2} dot={false} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
