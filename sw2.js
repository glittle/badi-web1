'use strict';
//const swWho = 'sw2';
//importScripts('sw_common.js');

console.log('in sw2 ');

function test2(){
    console.log('function in sw2')
}

addEventListener('message', function (event) {
    var msg = event.data;
    // console.log('incoming to sw:', msg)
    event.ports[0].postMessage({
        type: 'reply',
        text: 'This is my response from sw2 for: ' + msg.q
    });
});


var sw2 = 0;
setInterval(function () {
    send_message_to_all_clients({
        type: 'pulseA',
        text: 'SW2 reporting for duty! - ' + ++sw2
    });
}, 1000);

send_message_to_all_clients({
    type: 'log',
    text: 'SW2 running'
})

setTimeout(function () {
    send_message_to_all_clients({
        type: 'log',
        text: `SW2 reporting in at 65 seconds`
    });
}, 65 * 1000);
setTimeout(function () {
    send_message_to_all_clients({
        type: 'log',
        text: `SW2 reporting in at 2 minutes`
    });
}, 2 * 60 * 1000);
setTimeout(function () {
    send_message_to_all_clients({
        type: 'log',
        text: `SW2 reporting in at 5 minutes`
    });
}, 5 * 60 * 1000);



function logEvent(event) {
    var msg = [event.type];
    switch (event.type) {
        case 'fetch':
            msg.push(event.request.url);
            break;
        default:
            break;
    }
    msg.push(new Date().toLocaleTimeString());

    var payload = {
        type: 'log',
        text: msg.join(' - ')
    }
    send_message_to_all_clients(payload);
}

[
    'install',
    'activate',
    'message',
    'fetch',
    'push',
    'sync',
    'online',
    'offline'
].forEach(type => {
    addEventListener(type, logEvent);
});

send_message_to_all_clients({type:'log', text: 'Online: ' + navigator.onLine});
