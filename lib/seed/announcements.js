// @ts-check
import { SEED_USER_IDS } from "./users.js";

/** @type {import('../types.js').Announcement[]} */
export const seedAnnouncements = [
  {
    id: "ann_demo_notice",
    title: "Demo data only",
    message:
      "Every listing, booking and payment on Sheggar Wheels is simulated for a student project. Prices are shown in Ethiopian Birr.",
    active: true,
    createdAt: "2025-10-01T08:00:00.000Z",
    createdBy: SEED_USER_IDS.admin,
  },
  {
    id: "ann_holiday_notice",
    title: "Holiday availability",
    message:
      "Owners travelling over the holidays should block their dates from the availability screen.",
    active: false,
    createdAt: "2025-09-20T08:00:00.000Z",
    createdBy: SEED_USER_IDS.admin,
  },
];
