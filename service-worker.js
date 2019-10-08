'use strict';

var cacheVersion = 1;
var currentCache = {
	offline: 'offline-cache' + cacheVersion
};

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(currentCache.offline).then(function(cache) {
			return cache.addAll([
				'/',
				'/index.html',
				'/js/apikey.js',
				'/assets/site.webmanifest'
			]).then(() => self.skipWaiting());
		})
	);
});

self.addEventListener('activate', event => {
	event.waitUntil(this.clients.claim());
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.open(currentCache.offline)
		.then(cache => cache.match(event.request, {
			ignoreSearch: true
		}))
		.then(response => {
			return response || fetch(event.request);
		})
	);
});
