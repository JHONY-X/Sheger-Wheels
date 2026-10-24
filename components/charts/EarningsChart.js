"use client";

/**
 * Monthly earnings bar chart for the owner dashboard.
 *
 * Recharts requires a browser DOM, so this file is always a Client Component.
 * It is dynamically imported with { ssr: false } at the call site.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** @param {{ value: number }} props */
function EtbTick({ value }) {
  if (value === 0) return "0";
  if (value >= 1000) return `${value / 1000}k`;
  return String(value);
}

/** @param {{ active?: boolean, payload?: any[], label?: string }} props */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const etb = new Intl.NumberFormat("en-ET", { maximumFractionDigits: 0 });
  return (
    <div className="rounded-btn border border-line bg-white px-3 py-2 shadow-float text-sm">
      <p className="font-medium text-ink">{label}</p>
      <p className="mt-0.5 text-ochre-ink">
        ETB {etb.format(payload[0].value)}
      </p>
    </div>
  );
}

import { buildMonthlyEarnings } from "@/lib/charts";

export { buildMonthlyEarnings };

/**
 * @param {{ data: ReturnType<typeof buildMonthlyEarnings> }} props
 */
export function EarningsChart({ data }) {
  const hasData = data.some((d) => d.earnings > 0);

  if (!hasData) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        No paid bookings yet — earnings will appear here.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        barCategoryGap="35%"
      >
        <CartesianGrid vertical={false} stroke="#30343b" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#a5a7ad" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v) => EtbTick({ value: v })}
          tick={{ fontSize: 11, fill: "#a5a7ad" }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.06)" }} />
        <Bar
          dataKey="earnings"
          fill="#d1ad59"
          radius={[4, 4, 0, 0]}
          name="Earnings"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
