import { describe, expect, it } from "vitest";

import { buildMonthlyEarnings, buildStatusData } from "../lib/charts.js";

describe("buildMonthlyEarnings", () => {
  it("returns default month bins initialized to 0 when no bookings exist", () => {
    const data = buildMonthlyEarnings([], 6);
    expect(data).toHaveLength(6);
    expect(data.every((d) => d.earnings === 0)).toBe(true);
    expect(data[0]).toHaveProperty("month");
    expect(data[0]).toHaveProperty("label");
  });

  it("accumulates paid bookings only for recognized statuses", () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const bookings = [
      {
        id: "b1",
        status: "completed",
        paymentStatus: "paid",
        total: 5000,
        createdAt: `${thisMonth}-05T10:00:00Z`,
      },
      {
        id: "b2",
        status: "confirmed",
        paymentStatus: "paid",
        total: 2500,
        createdAt: `${thisMonth}-10T10:00:00Z`,
      },
      {
        id: "b3",
        status: "cancelled", // should be ignored even if paid
        paymentStatus: "paid",
        total: 3000,
        createdAt: `${thisMonth}-11T10:00:00Z`,
      },
      {
        id: "b4",
        status: "completed",
        paymentStatus: "pending", // unpaid should be ignored
        total: 4000,
        createdAt: `${thisMonth}-12T10:00:00Z`,
      },
    ];

    const data = buildMonthlyEarnings(bookings, 3);
    const currentEntry = data.find((d) => d.month === thisMonth);
    expect(currentEntry).toBeDefined();
    expect(currentEntry.earnings).toBe(7500);
  });
});

describe("buildStatusData", () => {
  it("counts bookings by status correctly", () => {
    const bookings = [
      { id: "b1", status: "requested" },
      { id: "b2", status: "confirmed" },
      { id: "b3", status: "confirmed" },
      { id: "b4", status: "completed" },
    ];

    const data = buildStatusData(bookings);
    const requested = data.find((d) => d.status === "requested");
    const confirmed = data.find((d) => d.status === "confirmed");
    const completed = data.find((d) => d.status === "completed");

    expect(requested).toMatchObject({ count: 1, label: "Requested" });
    expect(confirmed).toMatchObject({ count: 2, label: "Confirmed" });
    expect(completed).toMatchObject({ count: 1, label: "Completed" });
  });

  it("returns empty array if bookings array is empty", () => {
    const data = buildStatusData([]);
    expect(data).toEqual([]);
  });
});
