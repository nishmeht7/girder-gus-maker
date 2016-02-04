const eventEmitter = window.eventEmitter
app.controller('homectrl', function ($scope) {
    eventEmitter.on('what level to play', (data) => {
        console.log(data);
        eventEmitter.emit('play this level', ['levelId', '']);
    });
});
