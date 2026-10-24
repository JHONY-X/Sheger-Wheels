// @ts-check
"use client";

import { ACTIONS, allowedActions } from "./booking-state.js";

/**
 * Capability checks for UI and actions. Call it in the component to hide a
 * control, and again inside the action to refuse the write.
 *
 * @param {import('./types.js').User|null} user
 * @param {string} action
 * @param {any} [resource]
 */
export function can(user, action, resource) {
  if (!user || user.status === "suspended") return false;

  switch (action) {
    /* Platform administration */
    case "manageUsers":
    case "moderateCar":
    case "publishAnnouncement":
    case "resolveDispute":
      return user.roles.includes("admin");

    /* Owner resources — ownership is checked, not just the role */
    case "editCar":
    case "manageAvailability":
      return Boolean(resource) && resource.ownerId === user.id;

    /* Renter resources */
    case "requestBooking":
      return (
        user.roles.includes("renter") &&
        Boolean(resource) &&
        resource.ownerId !== user.id &&
        resource.status === "approved" &&
        resource.active === true
      );

    case "viewBooking":
      return Boolean(resource) &&
        (resource.renterId === user.id ||
          resource.ownerId === user.id ||
          user.roles.includes("admin"));

    /* Booking lifecycle actions delegate to the state machine */
    default:
      return Boolean(resource) &&
        Boolean(ACTIONS[action]) &&
        allowedActions(resource, user).includes(action);
  }
}
