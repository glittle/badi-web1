'use strict';



addEventListener('message', function (event) {
    var msg = event.data;
    console.log('incoming to sw:', msg)
    event.ports[0].postMessage({
        'test': 'This is my response from the sw for: ' + msg.q
    });
});

function send_message_to_all_clients(msg) {
    // http://craig-russell.co.uk/2016/01/29/service-worker-messaging.html
    console.log('sending to clients');
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            send_message_to_client(client, msg).then(m => console.log("SW Received Message: " + m));
        })
    })
}

function send_message_to_client(client, payload) {
    return new Promise(function (resolve, reject) {
        var msg_chan = new MessageChannel();

        msg_chan.port1.onmessage = function (event) {
            if (event.data.error) {
                reject(event.data.error);
            } else {
                resolve(event.data);
            }
        };

        client.postMessage(payload, [msg_chan.port2]);
    });
}

var x = 0;
setInterval(function(){
        send_message_to_all_clients({
            type: 'x',
            text: 'SW reporting for duty! - ' + ++x
        });
}, 2000);
















// adapted from cloudfour.com -- thanks!
const version = '0.0.1';
const cacheName = `wondrous@${version}`;

const manifest = '/rev-manifest.json';

/**
 * The "start  page" URL (as defined in manifest.json).
 */
const startPage = '/';

/**
 * The generic offline page URL.
 */
const offlinePage = '/offline/';

/**
 * The generic fallback image URL. This will be served in place of image 404s.
 */
const fallbackImage = '/images/badiIcon512.png';

/**
 * The asset "types" to represent various page subresources.
 */
const types = Object.freeze({
    iframe: Symbol('iframe'),
    image: Symbol('image'),
    page: Symbol('page'),
    script: Symbol('script'),
    stylesheet: Symbol('stylesheet'),
    font: Symbol('font')
});

/**
 * Mapping of file extensions to resource types.
 */
const typesByExtension = new Map([
    ['css', types.stylesheet],
    ['js', types.script],
    ['gif', types.image],
    ['jpg', types.image],
    ['png', types.image],
    ['svg', types.image],
    ['woff', types.font],
    ['woff2', types.font]
]);

/**
 * Mapping of request modes to resource types.
 */
const typesByMode = new Map([
    ['navigate', types.page]
]);

/**
 * Mapping of resource types to fetch/cache strategy functions.
 */
const routesByType = new Map([
    [types.font, fetchOfflineFirst],
    [types.iframe, fetchOnlineFirst],
    [types.image, fetchOfflineFirst],
    [types.page, fetchOnlineFirst],
    [types.script, fetchOfflineFirst],
    [types.stylesheet, fetchOfflineFirst],
    [undefined, fetchOnlineFirst]
]);

/**
 * Mapping of resource types to fallback responses.
 */
const fallbacks = new Map([
    [types.image, fallbackImage],
    [types.page, offlinePage]
]);

/**
 * The whitelist of URL hosts to handle for a fetch event.
 */
const hosts = [
    'localhost',
    'cloudfour.com',
    'php.cloudfour.test',
    'cdn.polyfill.io',
    'c4site.staging.wpengine.com',
    'cdn.cloudfour.com',
    '29comwzoq712ml5vj5gf479x-wpengine.netdna-ssl.com' // legacy
];

/**
 * The blacklist of URL path patterns to ignore for a fetch event.
 * Including: WordPress admin pages, preview posts, etc.
 */
const exclusions = [
    /\/wp-admin/,
    /\/wp-login/,
    /preview=true/
];

/**
 * Rules that must pass for a request to be handled.
 * Each function accepts a Request and returns a Boolean.
 */
const fetchRules = [
    request => request.method === 'GET',
    request => {
        const {
            hostname
        } = new URL(request.url);
        return hosts.some(host => host === hostname);
    },
    request => {
        const {
            url,
            referrer
        } = request;
        return exclusions.every(pattern =>
            !url.match(pattern) && !referrer.match(pattern)
        );
    },
    request => {
        const {
            url,
            mode
        } = request;
        return mode === 'navigate' ? url.endsWith('/') : true;
    }
];

/**
 * Fetch and cache strategy functions
 * ----------------------------------
 */

/**
 * Match a cached response.
 */
function readCache(request) {
    const options = {};
    return caches.match(request, options);
}

/**
 * Clone a response and add it to a cache.
 */
function writeCache(name, request, response) {
    // TODO: fix this. It's needed to allow special treatment for the 404 page.
    if (response.status === 404) {
        return response;
    }
    caches.open(name)
        .then(cache => cache.put(request, response))
        .then(() => logCached(request, response))
        .catch(err => console.warn(err));
    return response.clone();
}

/**
 * Fetch a response and also update the cached version of it.
 */
function fetchUpdate(request) {
    return fetch(request)
        .then(response => {
            return isGoodResponse(response, request) ?
                writeCache(cacheName, request, response) : response;
        })
        .catch(err => console.warn(err));
}

/**
 * Fetch a response and fallback to a cached version of it.
 */
function fetchOnlineFirst(request) {
    return fetchUpdate(request).then(response => {
        return isGoodResponse(response, request) ?
            response : readCache(request)
    });
}

/**
 * Match a cached response and fallback to fetching a new version.
 */
function fetchOfflineFirst(request) {
    return readCache(request).then(
        response => response || fetchUpdate(request)
    );
}

/**
 * Cache management functions
 * --------------------------
 */

/**
 * Delete all caches, optionally limited by a filter function.
 */
function deleteCaches(filter) {
    return caches.keys()
        .then(keys => filter ? keys.filter(filter) : keys)
        .then(keys => keys.map(key => caches.delete(key)))
        .then(deletions => Promise.all(deletions));
}

/**
 * Lookup an appropriate fallback response for a given resource type.
 */
function matchFallback(type) {
    const fallback = fallbacks.get(type);
    return fallback ?
        readCache(fallback) :
        Promise.resolve(new Response())
}

/**
 * Utility functions
 * -----------------
 */

/**
 * Return the file extension for a Request or Response URL.
 */
function getExtension(subject) {
    const {
        pathname
    } = new URL(subject.url);
    const [extension] = pathname.match(/(?!\.)\w+$/i) || [];
    return extension;
}

/**
 * Fetch a response and return its body as decoded JSON.
 */
function fetchJSON(request) {
    return fetch(request)
        .then(response => response.json());
}

/**
 * Fetch a response as decoded JSON, falling back to an empty object.
 */
function fetchObject(request) {
    return fetchJSON(request)
        .catch(() => ({}));
}

/**
 * Fetch a response as decoded JSON, falling back to an empty array.
 */
function fetchArray(request) {
    return fetchJSON(request)
        .catch(() => ([]));
}

/**
 * Check if a response exists and is a success.
 */
function isGoodResponse(response, request) {
    return response && (
        (response.ok) ||
        (response.status === 404 && request.mode === 'navigate') ||
        (response.type === 'opaque')
    );
}

/**
 * Check that an array of functions all return the same value when
 * called with a given parameter.
 */
function testAll(rules, result, subject) {
    return rules.every(rule => rule(subject) === result);
}

/**
 * Check that any functions within an array return a value when
 * called with a given parameter.
 */
function testAny(rules, result, subject) {
    return rules.some(rule => rule(subject) === result);
}

/**
 * Service worker event handlers
 * -----------------------------
 */

/**
 * Installation event handling
 */
addEventListener('install', event => {
    const dependencies = fetchObject(manifest)
        .then(data => Object.keys(data).map(key => data[key]))
        .then(vals => vals.concat(
            startPage,
            offlinePage,
            fallbackImage
        ));

    return event.waitUntil(
        Promise.all([caches.open(cacheName), dependencies])
        .then(([cache, urls]) => cache.addAll(urls))
        .catch(() => {
            console.warn('Service worker failed to install dependencies');
        })
        .then(skipWaiting())
    );
});

/**
 * Activate event handling
 */
addEventListener('activate', event => {
    deleteCaches(name => name !== cacheName);

    console.log('send to all')
    send_message_to_all_clients('SW reporting for duty!')

    return event.waitUntil(
        clients.claim()
    );
});

var timer = null;

function startTimerTests() {
    console.log('sw timer started')
    timer = setInterval(doTime, 2000);
}

function doTime() {
    console.log('sw interval timer');

}

/**
 * Fetch event handling
 */
addEventListener('fetch', event => {
    const request = event.request;

    // If we should handle this as a relevant request
    if (testAll(fetchRules, true, request)) {
        const mode = request.mode;
        const extension = getExtension(request);
        const type = typesByMode.get(mode) || typesByExtension.get(extension);
        const route = routesByType.get(type);
        const fallback = matchFallback(type);

        logHandler(route, request, request);

        event.preventDefault();

        return event.respondWith(
            route(request)
            .then(response => isGoodResponse(response, request) ? response : fallback)
            .catch(() => fallback)
        );
    }
});

/**
 * Debugging
 * ---------
 */

function logHandler(handler, request, ...details) {
    console.groupCollapsed(`handling ${request.url}`);
    console.log(handler.name, ...details);
    console.groupEnd();
}

function logCached(request, ...details) {
    console.groupCollapsed(`cache ${request.url}`);
    console.log(`entry set for ${request.url}`, ...details);
    console.groupEnd();
}

function logEvent(event) {
    let label = event.type;
    let details = [label, event];
    switch (event.type) {
        case 'fetch':
            label += ` ${event.request.url}`;
            details.push(event.request);
            break;
        default:
            break;
    }
    //   console.groupCollapsed(label);
    console.log(details);
    //   console.groupEnd();
}

[
    'install',
    'activate',
    'message',
    'push',
    'sync'
].forEach(type => {
    addEventListener(type, logEvent);
});