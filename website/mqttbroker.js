let mosca = require('mosca')
let settings = {port: 1884}
let broker = new mosca.Server(settings)
let url = "localhost"


broker.on('ready', ()=>{
    console.log('MQTT broker:\t\tstarted')
    console.log(`MQTT URL:\t\tmqtt://${url}:${settings['port']}`)
})

// For listening published messages
/*
broker.on('published', (packet)=>{
    message = packet.payload.toString()
    console.log(message)
})*/