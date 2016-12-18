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


    window.addEventListener('load', function () {
        console.log('loading 1')
        navigator.serviceWorker.register('/sw1.js').then(function (registration) {
            console.log('ServiceWorker 1 registration successful with scope: ', registration.scope);
        }).catch(function (err) {
            console.log('ServiceWorker 1 registration failed: ', err);
        });

        console.log('loading 2')
        navigator.serviceWorker.register('/sw2.js').then(function (registration) {
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
    });


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