'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const geofire = require('geofire-common');

if (!admin.apps.length) {
	admin.initializeApp();
}
const db = admin.firestore();

exports.queryNearby = functions.https.onCall(async (data, context) => {
	const appId = data.appId || 'default-app-id';
	const lat = Number(data.lat);
	const lon = Number(data.lon);
	const radiusKm = Number(data.radiusKm);
	const category = data.category || null;

	if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(radiusKm)) {
		return { results: [] };
	}

	// Compute geohash bounds for the circle
	const radiusM = radiusKm * 1000;
	const bounds = geofire.geohashQueryBounds([lat, lon], radiusM);

	const colRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('pois');
	const promises = [];
	for (const b of bounds) {
		promises.push(colRef
			.orderBy('geohash')
			.startAt(b[0])
			.endAt(b[1])
			.get());
	}

	const snapshots = await Promise.all(promises);
	const matches = [];
	snapshots.forEach((snap) => {
		snap.forEach((doc) => {
			const p = doc.data();
			if (category && p.category !== category) return;
			const distInKm = geofire.distanceBetween([lat, lon], [p.lat, p.lon]);
			if (distInKm <= radiusKm) {
				matches.push({
					id: doc.id,
					name: p.name || '',
					lat: p.lat,
					lon: p.lon,
					category: p.category || 'other',
					avgRating: 'N/A'
				});
			}
		});
	});

	return { results: matches };
});
