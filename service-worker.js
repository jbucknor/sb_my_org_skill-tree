/**
 * Service Worker for Life Skills Skill Tree PWA
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'skill-tree-v1.0.0';
const STATIC_CACHE = 'skill-tree-static-v1.0.0';

// Files to cache for offline functionality
const CACHE_FILES = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/css/themes.css',
    '/js/app.js',
    '/js/skill-data.js',
    '/js/user-progress.js',
    '/js/canvas-renderer.js',
    '/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching Files');
                return cache.addAll(CACHE_FILES);
            })
            .then(() => {
                console.log('Service Worker: Cached Files Successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Cache Failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Clearing Old Cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached files when offline
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return cachedResponse;
                }
                
                // Otherwise, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response (it can only be consumed once)
                        const responseToCache = response.clone();
                        
                        // Add successful responses to cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.log('Service Worker: Fetch failed, serving offline fallback', error);
                        
                        // Serve offline fallback for HTML pages
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // For other resources, you could return a generic offline response
                        throw error;
                    });
            })
    );
});

// Background sync for when connectivity is restored
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'progress-sync') {
        event.waitUntil(syncProgress());
    }
});

// Push notifications (for future enhancement)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received', event);
    
    const options = {
        body: event.data ? event.data.text() : 'New achievement available!',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'explore',
                title: 'View Skills',
                icon: '/assets/icons/icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icons/icon-192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Life Skills Skill Tree', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification click', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling for communication with main app
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_PROGRESS') {
        // Cache user progress data
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => {
                    return cache.put('/api/progress', new Response(JSON.stringify(event.data.progress)));
                })
        );
    }
});

/**
 * Sync progress data when connectivity is restored
 */
async function syncProgress() {
    try {
        // This would sync with a backend service if available
        // For now, we just use local storage
        console.log('Service Worker: Syncing progress data');
        
        // Could implement cloud backup sync here in the future
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Progress sync failed', error);
        throw error;
    }
}

/**
 * Clean up old cache entries
 */
async function cleanupCaches() {
    const cacheWhitelist = [STATIC_CACHE, CACHE_NAME];
    const cacheNames = await caches.keys();
    
    return Promise.all(
        cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
                console.log('Service Worker: Deleting old cache', cacheName);
                return caches.delete(cacheName);
            }
        })
    );
}

// Periodic cache cleanup
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cleanup-caches') {
        event.waitUntil(cleanupCaches());
    }
});