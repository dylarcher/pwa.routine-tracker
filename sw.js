const CACHE_NAME = "mcas-tracker-cache-v1";
const APP_SHELL_URLS = [
	"/",
	"/index.html",
	"/app.js",
	"/manifest.json",
	"https://cdn.tailwindcss.com",
	"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
	// Add paths to your icons and screenshots if you have them
	"/icons/icon-192x192.png",
	"/icons/icon-512x512.png",
	"/icons/icon-512x512.maskable.png",
	"/icons/shortcut-symptom.png",
	"/icons/shortcut-diet.png",
	// Add more static assets here
];

// Install event: caches the app shell
self.addEventListener("install", (event) => {
	console.log("Service Worker: Installing...");
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log("Service Worker: Caching app shell");
				return cache.addAll(APP_SHELL_URLS);
			})
			.catch((error) => {
				console.error("Service Worker: Caching failed during install:", error);
			}),
	);
});

// Activate event: cleans up old caches
self.addEventListener("activate", (event) => {
	console.log("Service Worker: Activating...");
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						console.log("Service Worker: Deleting old cache:", cacheName);
						return caches.delete(cacheName);
					}
				}),
			);
		}),
	);
	// Ensure the service worker takes control of clients immediately
	return self.clients.claim();
});

// Fetch event: serves content from cache or network
self.addEventListener("fetch", (event) => {
	// Check if the request is for a navigation (HTML page)
	if (event.request.mode === "navigate") {
		event.respondWith(
			caches.match(event.request).then((cachedResponse) => {
				// Return cached HTML if available, otherwise fetch from network
				return (
					cachedResponse ||
					fetch(event.request).catch(() => {
						// Fallback for offline if initial fetch fails
						return caches.match("/index.html"); // Serve the main app shell
					})
				);
			}),
		);
	} else {
		// For other assets (CSS, JS, images, etc.) - Cache-first strategy
		event.respondWith(
			caches.match(event.request).then((cachedResponse) => {
				// If cached response is found, return it
				if (cachedResponse) {
					return cachedResponse;
				}
				// Otherwise, fetch from the network
				return fetch(event.request)
					.then((networkResponse) => {
						// Try to cache the new response for future use
						return caches.open(CACHE_NAME).then((cache) => {
							// Only cache successful responses and non-CORS requests
							if (networkResponse.ok && networkResponse.type === "basic") {
								cache.put(event.request, networkResponse.clone());
							}
							return networkResponse;
						});
					})
					.catch(() => {
						// Fallback for network failures (e.g., image placeholders)
						// For a health app, this might involve showing a "no image" icon
						console.warn(
							"Service Worker: Fetch failed for:",
							event.request.url,
						);
						// You could return a placeholder image or a default asset here
						// e.g., return caches.match('/images/placeholder.png');
					});
			}),
		);
	}
});

// Background Sync (placeholder - requires a backend to fully implement)
// This would be used for sending data to a server when online
self.addEventListener("sync", (event) => {
	if (event.tag === "sync-new-logs") {
		console.log("Service Worker: Performing background sync for new logs...");
		event.waitUntil(syncNewLogs());
	}
});

async function syncNewLogs() {
	// In a real application, you would:
	// 1. Open IndexedDB
	// 2. Retrieve unsynced data (e.g., data marked with a 'synced: false' flag)
	// 3. Send data to your backend API using fetch()
	// 4. On successful sync, update IndexedDB records to 'synced: true' or delete them
	// 5. Handle network errors and retry logic

	console.log("Service Worker: Background sync logic would go here.");
	// Example: fetch('/api/upload-logs', { method: 'POST', body: JSON.stringify(unsyncedData) });
	// For this PWA, data is only stored locally in IndexedDB as there's no backend.
}

// Push Notifications (placeholder - requires a backend to send push messages)
self.addEventListener("push", (event) => {
	const data = event.data.json();
	console.log("Service Worker: Push received:", data);

	const title = data.title || "MCAS Tracker Reminder";
	const options = {
		body: data.body || "Time to log your symptoms or medication!",
		icon: "/icons/icon-192x192.png", // Or a specific notification icon
		badge: "/icons/badge.png", // Small icon for notification bar
		data: {
			url: data.url || "/", // URL to open when notification is clicked
		},
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close(); // Close the notification

	// Open the specified URL or the app's root URL
	event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});
