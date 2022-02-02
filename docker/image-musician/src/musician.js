
var protocol = require('./musician-protocol'); // Our port and ip address
const { v4: uuidv4 } = require('uuid'); // To generate unique user id
var dgram = require('dgram'); // We use a standard Node.js module to work with UDP
var socket = dgram.createSocket('udp4'); // Create datagram socket

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

// Defining musician class
function Musician (intrument) {

    // class attributes
    this.uuid = uuidv4();
    this.sound = instrumentMap.get(intrument);
    if (this.sound === undefined) {
        throw "Error : undefined instrument";
    }

    // Methode that "plays" a sound (multicast)
    Musician.prototype.play = function () {

        let payload = JSON.stringify(this); // Create JSON payload
        // JSON to UDP datagram and send
        let buf = new Buffer (payload);
        socket.send(buf, 0, buf.length, protocol.PROTOCOL_PORT,
            protocol.PROTOCOL_MULTICAST_ADDRESS, function () {
                        console.log("playing sound");
            });
    }
    // Send a sound every second
    setInterval(this.play.bind(this), 1000)
}

// Create a new musician using user defined instrument
new Musician(process.argv[2]);