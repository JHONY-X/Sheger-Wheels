// @ts-check
/** Seeded demo users. Stable IDs so tests and links can reference them. */

export const SEED_USER_IDS = {
  admin: "usr_admin",
  selam: "usr_selam",
  hanna: "usr_hanna",
  dawit: "usr_dawit",
  marta: "usr_marta",
  yonas: "usr_yonas",
};

/** @type {import('../types.js').User[]} */
export const seedUsers = [
  {
    id: SEED_USER_IDS.admin,
    name: "Platform Admin",
    email: "admin@sheggar.demo",
    phone: "+251 911 000 001",
    roles: ["admin"],
    status: "active",
    createdAt: "2025-01-04T08:00:00.000Z",
  },
  {
    id: SEED_USER_IDS.selam,
    name: "Selam Tesfaye",
    email: "selam@sheggar.demo",
    phone: "+251 911 234 567",
    roles: ["renter", "owner"],
    status: "active",
    createdAt: "2025-02-11T09:30:00.000Z",
  },
  {
    id: SEED_USER_IDS.hanna,
    name: "Hanna Girma",
    email: "hanna@sheggar.demo",
    phone: "+251 912 345 678",
    roles: ["renter", "owner"],
    status: "active",
    createdAt: "2025-03-02T10:15:00.000Z",
  },
  {
    id: SEED_USER_IDS.dawit,
    name: "Dawit Bekele",
    email: "dawit@sheggar.demo",
    phone: "+251 913 456 789",
    roles: ["renter"],
    status: "active",
    createdAt: "2025-04-18T07:45:00.000Z",
  },
  {
    id: SEED_USER_IDS.marta,
    name: "Marta Alemu",
    email: "marta@sheggar.demo",
    phone: "+251 914 567 890",
    roles: ["renter"],
    status: "active",
    createdAt: "2025-06-09T12:00:00.000Z",
  },
  {
    id: SEED_USER_IDS.yonas,
    name: "Yonas Tadesse",
    email: "yonas@sheggar.demo",
    phone: "+251 915 678 901",
    roles: ["renter"],
    status: "suspended",
    createdAt: "2025-07-21T14:20:00.000Z",
  },
];
