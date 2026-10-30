// @ts-check
/**
 * Shared data shapes. This file has no runtime code — it exists so editors
 * and `// @ts-check` can see the same model the storage layer guarantees.
 *
 * @typedef {'active'|'suspended'} UserStatus
 * @typedef {'renter'|'owner'|'admin'} Role
 *
 * @typedef {Object} User
 * @property {string}      id
 * @property {string}      name
 * @property {string}      email
 * @property {string}      phone
 * @property {Role[]}      roles
 * @property {UserStatus}  status
 * @property {string}      createdAt        ISO date-time
 *
 * @typedef {'automatic'|'manual'} Transmission
 * @typedef {'draft'|'pending'|'approved'|'rejected'|'inactive'} CarStatus
 *
 * @typedef {Object} Car
 * @property {string}        id
 * @property {string}        ownerId
 * @property {string}        make
 * @property {string}        model
 * @property {number}        year
 * @property {Transmission}  transmission
 * @property {number}        seats
 * @property {string}        fuel
 * @property {string}        city
 * @property {string}        neighbourhood
 * @property {number}        latitude
 * @property {number}        longitude
 * @property {number}        pricePerDay     ETB
 * @property {string[]}      photos
 * @property {string}        description
 * @property {CarStatus}     status
 * @property {boolean}       active
 * @property {string[]}      unavailableDates  YYYY-MM-DD
 * @property {string}        createdAt
 *
 * @typedef {'requested'|'confirmed'|'in_progress'|'completed'
 *          |'reviewed'|'declined'|'cancelled'|'disputed'|'resolved'} BookingStatus
 * @typedef {'unpaid'|'paid'|'refunded'} PaymentStatus
 * @typedef {'renter'|'owner'|'either'|'admin'} Actor
 *
 * @typedef {Object} Chauffeur
 * @property {string}   id
 * @property {string}   name
 * @property {'male'|'female'} gender
 * @property {string}   phone
 * @property {number}   pricePerDay    ETB
 * @property {number}   experienceYears
 * @property {number}   rating
 * @property {number}   tripsCompleted
 * @property {string[]} languages
 * @property {string}   avatar
 * @property {string}   bio
 * @property {boolean}  available
 *
 * @typedef {Object} Booking
 * @property {string}        id
 * @property {string}        reference    human-facing, e.g. SW-8F3A21
 * @property {string}        carId
 * @property {string}        renterId
 * @property {string}        ownerId
 * @property {string}        startDate      YYYY-MM-DD
 * @property {string}        endDate        YYYY-MM-DD
 * @property {number}        days
 * @property {number}        pricePerDay    snapshot at request time
 * @property {number}        subtotal
 * @property {number}        fee
 * @property {number}        total
 * @property {string}        [chauffeurId]  Optional assigned chauffeur ID
 * @property {string}        [chauffeurName] Snapshot of chauffeur name
 * @property {number}        [chauffeurPricePerDay] Snapshot of chauffeur rate per day
 * @property {number}        [chauffeurTotal] Total chauffeur fee across trip
 * @property {PaymentStatus} paymentStatus
 * @property {string}        [transactionRef]
 * @property {BookingStatus} status
 * @property {string}        createdAt
 * @property {string}        updatedAt
 *
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} bookingId
 * @property {string} carId
 * @property {string} renterId
 * @property {string} ownerId
 * @property {1|2|3|4|5} rating
 * @property {string} comment
 * @property {string} ownerReply
 * @property {string} createdAt
 *
 * @typedef {'open'|'resolved'} DisputeStatus
 * @typedef {Object} Dispute
 * @property {string} id
 * @property {string} bookingId
 * @property {string} openedBy
 * @property {string} reason
 * @property {string} description
 * @property {DisputeStatus} status
 * @property {string} resolutionNotes
 * @property {string} [resolvedBy]
 * @property {string} createdAt
 * @property {string} [resolvedAt]
 *
 * @typedef {Object} Announcement
 * @property {string} id
 * @property {string} title
 * @property {string} message
 * @property {boolean} active
 * @property {string} createdAt
 * @property {string} createdBy
 *
 * @typedef {Object} Session
 * @property {string} userId
 * @property {string} signedInAt
 *
 * @typedef {Object} Snapshot
 * @property {User[]} users
 * @property {Car[]} cars
 * @property {Booking[]} bookings
 * @property {Review[]} reviews
 * @property {Dispute[]} disputes
 * @property {Announcement[]} announcements
 * @property {Chauffeur[]} chauffeurs
 * @property {Session|null} session
 * @property {{ available: boolean, recoveredKeys: string[] }} storage
 *
 * @typedef {{ ok: true, booking: Booking }
 *         | { ok: false, code: string, message: string }} ActionResult
 */

export {};
