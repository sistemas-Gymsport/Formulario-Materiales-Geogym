import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState } from '../common/Feedback.jsx';
import { BarChart3 } from 'lucide-react';

export const PALETTE = ['#F64851', '#393939', '#B5A595', '#FF9A9E', '#77716A', '#D9CEC1', '#000000', '#C7363E'];
const AXIS = { fontSize: 12, fontWeight: 700, fill: '#6f6a63' };
const GRID = { stroke: 'rgba(57,57,57,.12)', strokeDasharray: '3 4', vertical: false };

const ChartTooltip = ({ active, payload, label, unit = 'solicitudes' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span>{label ?? payload[0].payload.name}</span>
      {payload.map((p) => (
        <strong key={p.dataKey ?? p.name} style={payload.length > 1 ? { color: p.color ?? p.payload.fill } : undefined}>
          {payload.length > 1 ? `${p.name}: ` : ''}
          {p.value} {payload.length > 1 ? '' : unit}
        </strong>
      ))}
    </div>
  );
};

const hasData = (data, key = 'value') => data?.some((d) => d[key] > 0);

const Empty = () => (
  <EmptyState icon={BarChart3} title="Sin datos en este mes">
    Las gráficas aparecerán cuando existan solicitudes.
  </EmptyState>
);

const truncate = (text, size = 14) => (text.length > size ? `${text.slice(0, size - 1)}…` : text);

export const BranchBarChart = ({ data }) =>
  hasData(data) ? (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => truncate(v, 11)} interval={0} />
        <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(246,72,81,.08)' }} />
        <Bar dataKey="value" radius={[10, 10, 4, 4]} maxBarSize={52} animationDuration={900}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={i === 0 ? '#F64851' : '#393939'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <Empty />
  );

export const RankingChart = ({ data, unit = 'solicitudes' }) =>
  data?.length ? (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 34 + 20)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
        <CartesianGrid {...GRID} horizontal={false} vertical />
        <XAxis type="number" allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={150} tick={{ ...AXIS, fill: '#393939' }} tickLine={false} axisLine={false} tickFormatter={(v) => truncate(v, 20)} />
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: 'rgba(246,72,81,.08)' }} />
        <Bar dataKey="value" radius={[4, 10, 10, 4]} barSize={18} animationDuration={900}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={i < 3 ? '#F64851' : '#393939'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <Empty />
  );

export const CategoryDonut = ({ data }) => {
  if (!hasData(data)) return <Empty />;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="86%" paddingAngle={2} stroke="none" animationDuration={900}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, fill: '#000' }}>
          {total}
        </text>
        <text x="50%" y="56%" textAnchor="middle" style={{ fontSize: 11, fontWeight: 800, fill: '#6f6a63', letterSpacing: '.1em' }}>
          SELECCIONES
        </text>
        <Tooltip content={<ChartTooltip unit="selecciones" />} />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12.5, fontWeight: 700 }} formatter={(v) => <span style={{ color: '#393939' }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const DailyAreaChart = ({ data }) =>
  hasData(data) ? (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F64851" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#F64851" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="day" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} labelFormatter={(d) => `Día ${d}`} />
        <Area type="monotone" dataKey="value" stroke="#F64851" strokeWidth={3} fill="url(#dailyFill)" activeDot={{ r: 6, fill: '#000', stroke: '#F64851', strokeWidth: 3 }} animationDuration={1100} />
      </AreaChart>
    </ResponsiveContainer>
  ) : (
    <Empty />
  );

export const BranchCategoryChart = ({ data }) =>
  data?.rows?.length ? (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data.rows} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={false} interval={0} tickFormatter={(v) => truncate(v, 11)} />
        <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(246,72,81,.08)' }} />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
        {data.categories.map((c, i) => (
          <Bar key={c} dataKey={c} stackId="a" fill={PALETTE[i % PALETTE.length]} maxBarSize={56} radius={i === data.categories.length - 1 ? [8, 8, 0, 0] : 0} animationDuration={900} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <Empty />
  );
