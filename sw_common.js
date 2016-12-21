console.log('helper ' + swWho)

console.log('loaded helper!')

function send_message_to_all_clients(msg) {
    // http://craig-russell.co.uk/2016/01/29/service-worker-messaging.html
    // console.log('sending', msg)
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            send_message_to_client(client, msg).then(m => console.log("SW Received Reply: ", m));
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
        // console.log('sending2', payload)
        // console.log('sending2',payload.text)
        client.postMessage(payload, [msg_chan.port2]);
    });
}

