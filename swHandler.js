var loadWorkers = false;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function (event) {
        var payload = event.data;
        switch (payload.type) {
            case 'pulse':
                app.message = payload.text;
                break;
            case 'log':
                console.log('incoming from a sw:', payload)
                console.log(app.log)
                app.log = [app.log || '', payload.text].join('\n');
                console.log(app.log)
                break;
            default:
                console.log('incoming from a sw:', payload)
                break;
        }
        // event.ports[0].postMessage("Client 1 Says 'Hello back!'");
    });

    if (loadWorkers) {
        navigator.serviceWorker.register('/sw2.js', {
            scope: '/'
        }).then(function (registration) {
            console.log('ServiceWorker 2 registration successful with scope: ', registration.scope);

            if (navigator.serviceWorker.controller) {
                swHandler.sendMessage({
                    q: 'hello sw?',
                    type: 123
                }).then(function (reply) {
                    console.log('The reply is: ', reply)
                });
            }
        }).catch(function (err) {
            console.log('ServiceWorker 2 registration failed: ', err);
        });


        navigator.serviceWorker.register('/sw4.js', {
                scope: '/'
            })
            // Wait until the service worker is active.
            .then(function (registration) {
                console.log('ServiceWorker 4 registration successful with scope: ', registration.scope);
                return navigator.serviceWorker.ready;
            })
            // ...and then show the interface for the commands once it's ready.
            .catch(function (error) {
                // Something went wrong during registration. The service-worker.js file
                // might be unavailable or contain a syntax error.
                console.log(error);
            });
    }
    // navigator.serviceWorker.register('/sw3.js')
    //     .then(function (registration) {
    //         console.log('ServiceWorker 3 registration successful with scope: ', registration.scope);

    //         // Registration was successful. Now, check to see whether the service worker is controlling the page.
    //         if (navigator.serviceWorker.controller) {
    //             // If .controller is set, then this page is being actively controlled by the service worker.
    //             document.querySelector('#status').textContent = 'The service worker is currently handling network operations. ' +
    //                 'If you reload the page, the images (and everything else) will be served from the service worker\'s cache.';
    //         } else {
    //             // If .controller isn't set, then prompt the user to reload the page so that the service worker can take
    //             // control. Until that happens, the service worker's fetch handler won't be used.
    //             document.querySelector('#status').textContent = 'Please reload this page to allow the service worker to handle network operations.';
    //         }
    //     }).catch(function (error) {
    //         // Something went wrong during registration. The service-worker.js file
    //         // might be unavailable or contain a syntax error.
    //         document.querySelector('#status').textContent = error;
    //     });




    // window.addEventListener('load', function () {
    // console.log('loading 1')
    // navigator.serviceWorker.register('/sw1.js').then(function (registration) {
    //     console.log('ServiceWorker 1 registration successful with scope: ', registration.scope);
    // }).catch(function (err) {
    //     console.log('ServiceWorker 1 registration failed: ', err);
    // });

    // console.log('loading 2')
    // });
} else {
    // The current browser doesn't support service workers.
    var aElement = document.createElement('a');
    //TODO - integrate message
    aElement.href = 'http://www.chromium.org/blink/serviceworker/service-worker-faq';
    aElement.textContent = 'Service workers are not supported in the current browser.';
    document.querySelector('#status').appendChild(aElement);
}

var swHandler = {
    sendMessage: function (message) {
        // This wraps the message posting/response in a promise, which will resolve if the response doesn't
        // contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
        // controller.postMessage() and set up the onmessage handler independently of a promise, but this is
        // a convenient wrapper.
        return new Promise(function (resolve, reject) {
            var messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = function (event) {
                if (event.data.error) {
                    reject(event.data.error);
                } else {
                    resolve(event.data);
                }
            };

            // This sends the message data as well as transferring messageChannel.port2 to the service worker.
            // The service worker can then use the transferred port to reply via postMessage(), which
            // will in turn trigger the onmessage handler on messageChannel.port1.
            // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
            navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
        });
    }
}