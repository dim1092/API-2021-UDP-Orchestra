const protocol = require('./auditor-protocol'); // Our port and ip address
var musicians = new Map(); // To store our musicians
// Instrument / sound map
const instrumentMap = new Map(
    [
        ["piano", "ti-ta-ti"],
        ["trumpet", "pouet"],
        ["flute", "trulu"],
        ["violin", "gzi-gzi"],
        ["drum", "boum-boum"]
    ]
)


// -------------- Listening on UDP for new sounds --------------
var dgram = require('dgram'); // We use a standard Node.js module to work with UDP
var socket = dgram.createSocket('udp4'); // Create datagram socket

// bind to socket and listen need to join multicast group
socket.bind(protocol.PROTOCOL_PORT, function() {
    console.log("Joining multicast group");
    socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

// callback for received datagram
socket.on('message', function(msg, source) {
    console.log("Received sound sound");

    let sound = JSON.parse(msg); // Parsing musician object
    if (!musicians.has(sound.uuid)) {
        let musician = new Object();
        musician.uuid = sound.uuid;
        musician.instrument = instrumentMap.get(sound.sound);
        musician.activeSince = Date.now(); // Adding attribute
        musicians.set(sound.uuid, musician); // Adding to our musicians list if new
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
    let activeMusicians = new Array(0);
    musicians.forEach(musician => function() {
        if (Date.now() - musician.lastHeard < 5000) {
            activeMusicians.push(musician);
        }
    });

    let message = JSON.stringify(activeMusicians);
    let buf = new Buffer(message);
    socket.write(buf);
    socket.close();
})