const FILES_TO_CACHE = [
	'/',
	'/index.html',
	'/index.js',
	'/db.js',
	'/manifest.webmanifest',
	'/styles.css',
	'/icons/icon-192x192.png',
	'/icons/icon-512x512.png'
];
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';
self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(PRECACHE)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
});
self.addEventListener( 'activate', function ( evt ) {
	evt.waitUntil(
		caches.keys().then( keyList => {
			return Promise.all(
				keyList.map( key => {
					if ( key !== PRECACHE && key !== RUNTIME ) {
						console.log( 'Remove old Cache', key );
						return caches.delete( key );
					}
				} )
			);
		} )
	);

	self.clients.claim();
} );
self.addEventListener( 'fetch', function ( evt ) {
	if ( evt.request.url.includes( '/api/' ) ) {
		evt.respondWith(
			caches.open( RUNTIME ).then( cache => {
				return fetch( evt.request )
					.then( response => {
						if ( response.status === 200 ) {
							cache.put( evt.request.url, response.clone() );
						}
						return response;
					} )
					.catch( err => {
						return cache.match( evt.request );
					} );
			} ).catch( err => console.log( err ) )
		);

		return;
	}

	evt.respondWith(
		caches.match( evt.request ).then( function ( response ) {
			return response || fetch( evt.request );
		} )
	);
} );
