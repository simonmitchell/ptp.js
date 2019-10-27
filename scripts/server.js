define(['./packet','./connection-settings', './main-loop', './event-loop', './data-factory'], function (packet, connectionSettings, mainLoop, eventLoop, dataFactory) {

    var net = require('net');

    var guid = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        onConnection,
        name = '',
        start,
        sessionId,
        sockets = [];

    onConnection = function (socket) {

        sockets.push(socket);

        socket.on('data', function(data) {

            let packets = packet.parsePackets(dataFactory.create(data));
            if (packets.length === 1 && packets[0].type === packet.types.initCommandRequest) {
                console.log("Received Init_Command_Request\n", packets[0]);
                let sessionId = Math.floor(Math.random() * 4294967295/2);
                let data = packet.createInitCommandAck(sessionId, guid, name);
                console.log("Sending Init_Command_Ack in response\n", {
                    sessionId: sessionId, 
                    guid: guid, 
                    name: name
                });
                socket.write(data.buffer);
                mainLoop.sessionId = sessionId;
                mainLoop.initialize(socket);
            } else if (packets.length === 1 && packets[0].type === packet.types.initEventRequest) {
                console.log("Received Init_Event_Request", packets[0]);
                let sessionId = packets[0].sessionId;
                let data = packet.createInitEventAck();
                socket.write(data.buffer);
                eventLoop.sessionId = sessionId;
                eventLoop.initialize(socket);
                console.log("Sending Init_Event_Ack in response", sessionId);
            }
            // Write the data back to all the connected, the client will receive it as data from the server
        });

        // Add a 'close' event handler to this instance of socket
        socket.on('close', function(data) {
            let index = sockets.findIndex(function(o) {
                return o.remoteAddress === socket.remoteAddress && o.remotePort === socket.remotePort;
            })
            if (index !== -1) sockets.splice(index, 1);
            console.log('CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort);
        });
    };

    start = function () {

        var ptpServer = net.createServer();

        ptpServer.listen(15740, connectionSettings.host, () => {
  
        });

        ptpServer.on('connection', onConnection);
    };
    
    return Object.create(null, {
        start: {value: start},
        name: {set: function (x) {
            name = x;
        }},
        guid: {set: function (x) {
            guid = x;
        }}
    });
});
