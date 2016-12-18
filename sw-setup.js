if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);

            swHelper.sendMessage({
                q: 'hello sw?',
                type: 123
            }).then(function (reply) {
                console.log('The reply is: ', reply)
            });

        }).catch(function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });

     navigator.serviceWorker.addEventListener('message', function(event){
        console.log("Client Received Message: ", event.data);
        app.message = event.data;
        event.ports[0].postMessage("Client 1 Says 'Hello back!'");
    });
}

var swHelper = {
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