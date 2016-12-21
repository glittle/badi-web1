var app;

function BasePage() {
    var settings = {
        timer: null
    }

    function startPage() {
        connectVue();
        startTimerTest();
        notifyNow();
        app.status = navigator.onLine ? '' : 'offline';

        // testAlarms();
    }

    function testAlarms() {
        console.log('test alarm 1')
        var soon = new Date();
        soon.setSeconds(soon.getSeconds() + 70)

        chrome.alarms.create('alarm1', {
            when: soon.getTime()
        });

        chrome.alarms.clearAll();
        chrome.alarms.onAlarm.addListener(alarmHandler);
        console.log('test alarm 2')
    }

    var alarmHandler = function (alarm) {
        console.log(alarm.name);
    };

    function startTimerTest() {

        settings.timer = setInterval(doInterval, 50);
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
                messageA: '',
                messageB: '',
                log: '',
                test1: '',
                nameI: 16,
                nameNum: 5,
                status: ''
            },
            ready: function () {
                document.addEventListener('change', this.docChange)
            },
            methods: {
                docChange: function () {
                    test1 = screen.orientation;
                },
                notifyNow: function (ev) {
                    notifyNow();
                }
            },
            computed: {
                icon2: function () {
                    return myPage.draw(names[this.nameI], this.nameNum, 'center', 96)
                }
            }
        })
    }

    var nameSet = "Ayyám-i-Há,Bahá,Jalál,Jamál,`Aẓamat,Núr,Rahmat,Kalimát,Kamál,Asmá’,`Izzat,Mas\u0332h\u0332íyyat,`Ilm,Qudrat,Qawl,Masá'il,S\u0332h\u0332araf,Sulṭán,Mulk,`Alá’";
    var names = nameSet.split(',');

    function notifyNow() {
        notify('Questions 9 ⇨ 4:30pm', 'Today!!!', 'Questions', 9, false)
    }

    var notify = function (note1, note2, icon1, icon2, makeSound) {
        // Check for notification compatibility.
        if (!'Notification' in window) {
            // If the browser version is unsupported, remain silent.
            return;
        }
        // Log current permission level
        // If the user has not been asked to grant or deny notifications
        // from this domain...
        if (Notification.permission === 'default') {
            console.log('asking for permission to notify');
            Notification.requestPermission(function () {
                // ...callback this function once a permission level has been set.
                notify(note1, note2, icon1, icon2, makeSound);
            });
        }
        // If the user has granted permission for this domain to send notifications...
        else if (Notification.permission === 'granted') {
            console.log('showing notification', note1)
            navigator.serviceWorker.ready.then(function (registration) {
                var n = registration.showNotification(note1, {
                    body: note2,
                    // icon: draw('Questions', '7', 'center', 128),
                    icon: '/images/badiIcon192.png',
                    //image: '/images/badiIcon32.png',
                    //badge: '/images/19.png',
                    badge: draw(icon1, icon2, 'center', 128),
                    tag: 'badi',
                    silent: !makeSound,
                    renotify: true,
                    requireInteraction: true
                });
                // Remove the notification from Notification Center when clicked.
                n.onclick = function () {
                    console.log('Notification clicked');
                    registration.cl
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
        console.log('drawing new image')
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        var fontName = 'Roboto, sans-serif';

        context.fillStyle = getStorage('iconTextColor', 'black');

        //http://tutorials.jenkov.com/html5-canvas/text.html

        var fontBasis = size * .9;

        var fontSize = fontBasis / 1.9;
        var vOffset = fontSize * .3;
        context.font = `${fontSize}px ${fontName}`;
        context.textBaseline = 'hanging';
        context.fillText(line1, -2, 0);

        fontSize = fontBasis / 1.2;
        //vOffset = fontSize * .05;
        context.font = `bold ${fontSize}px ${fontName}`;
        context.textAlign = line2Alignment;
        context.textBaseline = 'alphabetic';
        var x = 0;
        switch (line2Alignment) {
            case 'center':
                x = size / 2;
                break;
        }
        context.fillText(line2, x, size);

        // return context.getImageData(0, 0, size, size);
        return canvas.toDataURL();
    }

    function drawLargeIcon(number) {

    }


    function getStorage(x, y) {
        return y;
    }

    updateOnlineStatus = function (ev) {
        app.status = ev.type;
    }
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('online', updateOnlineStatus);

    return {
        start: startPage,
        draw: draw
    }
}


var myPage = BasePage();

document.addEventListener("DOMContentLoaded", function () {
    myPage.start();
});

var OneSignal = window.OneSignal || [];
OneSignal.push(["init", {
    appId: "2b535ce7-1ca1-4950-813f-2d89c9f281c2",
    autoRegister: false,
    notifyButton: {
        enable: false
    },
    welcomeNotification: {
        message: 'You are ready for notifications!'
    },
    safari_web_id: 'web.onesignal.auto.2c31ff0c-1624-4aec-8f89-a4f0b1da0ea1'
}]);

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-1312528-11', 'auto');
ga('send', 'pageview');