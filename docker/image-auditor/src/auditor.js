const protocol = require('./auditor-protocol'); // Our port and ip address
var musicians = new Map(); // To store our musicians
// Instrument / sound map
const instrumentMap = new Map(
    [
        ["ti-ta-ti", "piano"],
        ["pouet", "trumpet"],
        ["trulu", "flute"],
        ["gzi-gzi", "violin"],
        ["boum-boum", "drum"]
    ]
)

// -------------- Listening on UDP for new sounds --------------
var dgram = require('dgram'); // We use a standard Node.js module to work with UDP
var socket = dgram.createSocket('udp4'); // Create datagram socket

// bind to socket and listen, need to join multicast group
socket.bind(protocol.PROTOCOL_PORT, function() {
    console.log("Joining multicast group");
    socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

// callback for received datagram
socket.on('message', function(msg, source) {
    let sound = JSON.parse(msg); // Parsing musician object
    console.log("Received sound : " + sound.sound);
    if (!musicians.has(sound.uuid)) {
        let struct = {};
        let musician = {};
        musician.uuid = sound.uuid;
        musician.instrument = instrumentMap.get(sound.sound);
        musician.activeSince = Date.now(); // Adding attribute
        struct.musician = musician;
        musicians.set(sound.uuid, struct); // Adding to our musicians list if new
    }
    musicians.get(sound.uuid).lastHeard = Date.now(); // Update last time active
});

// -------------- Listening on TCP for new connections --------------

var net = require('net');
var tcpServer = net.createServer();

// Listening for connection request
tcpServer.listen(protocol.PROTOCOL_PORT);

// When a connection is established send active musicians
tcpServer.on('connection', function (socket) {
    console.log("TCP : connected")
    let activeMusicians = new Array(0);
    // Adding active musician in the array
    musicians.forEach(function(value, key, map) {
        if (Date.now() - value.lastHeard < 5000) {
            activeMusicians.push(value.musician);
        }
    });

    let message = JSON.stringify(activeMusicians);
    let buf = new Buffer(message);
    socket.write(buf);
    socket.end();
})