var app;

function BasePage() {
    var settings = {
        timer: null
    }

    function startPage() {
        connectVue();
        startTimerTest();
        notifyNow();
    }

    function startTimerTest() {

        settings.timer = setInterval(doInterval, 5000);
    }

    function doInterval() {
        app.updateTime = new Date().toString();

    }

    function connectVue() {
        app = new Vue({
            el: '#app',
            data: {
                loadTime: new Date().toString(),
                updateTime: new Date().toString(),
                swTime: new Date().toString(),
                message: ''
            },
            methods: {
                notifyNow: function (ev) {
                    notifyNow();
                },
                icon: function (size) {
                    return myPage.draw('Questions', 19, 'center', size)
                }
            }
        })
    }

    function notifyNow() {
       notify('Questions 8 ⇨ 4:30pm', 'Today!!!', 'Questions', 8)
    }

    var notify = function (note1, note2, icon1, icon2) {
        // Check for notification compatibility.
        if (!'Notification' in window) {
            // If the browser version is unsupported, remain silent.
            return;
        }
        // Log current permission level
        console.log(Notification.permission);
        // If the user has not been asked to grant or deny notifications
        // from this domain...
        if (Notification.permission === 'default') {
            Notification.requestPermission(function () {
                // ...callback this function once a permission level has been set.
                notify();
            });
        }
        // If the user has granted permission for this domain to send notifications...
        else if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(function (registration) {
                var n = registration.showNotification(note1, {
                    body: note2,
                    // icon: draw('Questions', '7', 'center', 128),
                    icon: '/images/badiIcon192.png',
                    //image: '/images/badiIcon32.png',
                    //badge: '/images/19.png',
                    badge: draw(icon1, icon2, 'center', 128),
                    tag: 'badi',
                    silent: false,
                    renotify: true,
                    requireInteraction: true
                });
                // Remove the notification from Notification Center when clicked.
                n.onclick = function () {
                    console.log('Notification clicked');
                    this.close();
                };
                // Callback function when the notification is closed.
                n.onclose = function () {
                    console.log('Notification closed');
                };
            });
        }
        // If the user does not want notifications to come from this domain...
        else if (Notification.permission === 'denied') {
            // ...remain silent.
            console.log('permission to notify - denied')
            return;
        }
    };


    function draw(line1, line2, line2Alignment, size) {
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        var fontName = 'Roboto';

        context.fillStyle = getStorage('iconTextColor', 'black');

        var fontBasis = size * .9;

        var fontSize = fontBasis / 1.9;
        var vOffset = fontSize * .25;
        context.font = `${fontSize}px ${fontName}`;
        context.fillText(line1, 0, fontSize - vOffset);

        fontSize = fontBasis / 1.4;
        vOffset = fontSize * .05;
        context.font = `bold ${fontSize}px ${fontName}`;
        context.textAlign = line2Alignment;
        var x = 0;
        switch (line2Alignment) {
            case 'center':
                x = size / 2;
                break;
                //    case 'end':
                //      x = size;
                //      break;
        }
        context.fillText(line2, x, size - vOffset);

        // return context.getImageData(0, 0, size, size);
        return canvas.toDataURL();
    }

    function getStorage(x, y) {
        return y;
    }

    return {
        start: startPage,
        draw: draw
    }
}


var myPage = BasePage();

document.addEventListener("DOMContentLoaded", function () {
    myPage.start();
});