'use strict';
const swWho = 'sw2';
importScripts('swHelper.js'); 

addEventListener('message', function (event) {
    var msg = event.data;
    // console.log('incoming to sw:', msg)
    event.ports[0].postMessage({
        type: 'reply',
        text: 'This is my response from sw2 for: ' + msg.q
    });
});


var x = 0;
setInterval(function () {
    send_message_to_all_clients({
        type: 'pulse',
        text: 'SW2 reporting for duty! - ' + ++x
    });
}, 1000);

send_message_to_all_clients({type: 'log', text: 'SW2 running'})
