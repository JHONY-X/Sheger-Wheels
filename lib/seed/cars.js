// @ts-check
import carsData from "./cars.json";

/** @type {typeof carsData.neighbourhoods} */
export const NEIGHBOURHOODS = carsData.neighbourhoods;

/** @type {typeof carsData.ids} */
export const SEED_CAR_IDS = carsData.ids;

/** @param {string} photo @returns {{ year: number, make: string, model: string }} */
function identityFromPhoto(photo) {
	const filename = decodeURIComponent(photo.split("/").at(-1) ?? "")
		.replace(/\.[^.]+$/, "")
		.replace(/_\d+$/, "")
		.trim();
	const match = /^(\d{4})\s+(\S+)\s+(.+)$/.exec(filename);

	if (!match) {
		throw new Error(`Expected year, make, and model in car photo filename: ${photo}`);
	}

	return { year: Number(match[1]), make: match[2], model: match[3] };
}

/** @type {import('../types.js').Car[]} */
export const seedCars = carsData.cars.map((car) => ({
	...car,
	...identityFromPhoto(car.photos[0]),
}));
