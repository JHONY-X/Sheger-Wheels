"use client";

/**
 * Booking-by-status bar chart for the admin dashboard.
 *
 * Client Component; dynamically imported with { ssr: false } at the call site.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { buildStatusData, STATUS_META } from "@/lib/charts";

export { buildStatusData, STATUS_META };

/** @param {{ active?: boolean, payload?: any[], label?: string }} props */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-btn border border-line bg-white px-3 py-2 shadow-float text-sm">
      <p className="font-medium text-ink">{label}</p>
      <p className="mt-0.5 text-muted">
        {payload[0].value} {payload[0].value === 1 ? "booking" : "bookings"}
      </p>
    </div>
  );
}

/**
 * @param {{ data: ReturnType<typeof buildStatusData> }} props
 */
export function BookingStatusChart({ data }) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        No bookings yet — this chart will update as requests come in.
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
          tick={{ fontSize: 10, fill: "#a5a7ad" }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={48}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#a5a7ad" }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.06)" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Bookings">
          {data.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
