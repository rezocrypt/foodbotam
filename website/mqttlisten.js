var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost:1884')
client.on('connect', function () {
    client.subscribe('NameOfTopic')
})
client.on('message', function (topic, message) {
context = message.toString();
console.log(context)
})
