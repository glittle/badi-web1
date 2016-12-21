// from http://bl.ocks.org/homam/d4c9100abead7c97ffab4f7d4c94b26b
const swWho = 'sw6';
importScripts('sw_common.js');

importScripts('sw2.js')


const cacheName = 'BadiWeb.sw6'

const urlsToPreload = new Set([
    '/sw2.js',
    '/sw6.js',
    '/sw_common.js',
    '/manifest.json',
    '/images/badiIcon192.png'
].map(u => new URL(u, self.location).href))

const urlsToSkip = [
    'https://www.google-analytics.com/',
    'chrome-extension://'
];


function okayToCacheThis(url) {
    for (var i = 0; i < urlsToSkip.length; i++) {
        if (url.startsWith(urlsToSkip[i])) {
            return false;
        }
    }
    return true;
}

self.addEventListener('install', e => {
    console.log('% install sw6')
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(Array.from(urlsToPreload))
                .then(() => self.skipWaiting());
        })
    )
});

self.addEventListener('activate', event => {
    console.log('% activate sw6')
        // event.waitUntil(self.clients.claim());

    event.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if ([cacheName].indexOf(key) === -1) {
                    console.log('# deleting', key)
                    return caches.delete(key);
                }
            }));
        })
    );
});

const saveToCache = (event, cache, response, log) => {
    if (okayToCacheThis(event.request.url)) { // remove the condition to cache everything!
        console.log(log, event.request.url);
        cache.put(event.request, response.clone());
    }
    return response;
}

const fromRemoteServer = event => event.respondWith(
    caches.open(cacheName).then(cache =>
        fetch(event.request.clone()).then(response =>
            saveToCache(event, cache, response, '* refreshed in cache')
        )
    )
);

const fromCache = event => event.respondWith(
    caches.open(cacheName).then(cache =>
        cache.match(event.request).then(resp => {
            if (!!resp) {
                console.log('> served from cache', event.request.url)
                return resp;
            }
            return fetch(event.request)
                .then(response =>
                    saveToCache(event, cache, response, '$ added to cache')
                )
        })
    )
);

self.addEventListener('fetch', event => {
    console.log('fetch in sw6', navigator.onLine)
    navigator.onLine ? fromRemoteServer(event) : fromCache(event);
});

var x = 0;
setInterval(function () {
    send_message_to_all_clients({
        type: 'pulseB',
        text: 'sw6 reporting for duty! - ' + ++x
    });
}, 1000);

test2();
