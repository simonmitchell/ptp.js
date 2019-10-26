define(['./packet','./connection-settings', './main-loop', './data-factory'], function (packet, connectionSettings, mainLoop, dataFactory) {

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
            // TODO(gswirski): if I understand correctly, this function can receive half a packet
            // We should buffer remaining unparsed data

            let packets = packet.parsePackets(dataFactory.create(data));
            console.log("received PTP/IP packets", packets);

            let handleInitCommandRequest = function (request) {
                console.log("Received Init_Command_Request", request);
                let sessionId = Math.floor(Math.random() * 4294967295/2);
                let data = packet.createInitCommandAck(sessionId, guid, name);
                console.log("Sending Init_Command_Ack in response", sessionId, guid, name);
                socket.write(data.buffer);
                mainLoop.sessionId = sessionId;
                mainLoop.initialize(socket);
            };

            let handleInitEventRequest = function (request) {
                console.log("Received Init_Event_Request", request);
                let sessionId = request.sessionId;
                let data = packet.createInitEventAck(sessionId);
                socket.write(data.buffer);
                console.log("Sending Init_Event_Ack in response", sessionId);
            };

            let toBytes = function (hexString) {
              var c, cnt = 0, result = [], mapping = {
                '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15
              };
              for (var i = 0; i < hexString.length; i++) {
                c = hexString[i];
                if (c == ' ') {
                  continue;
                }
                if (cnt % 2 == 0) {
                  result.push(mapping[c]);
                } else {
                  result[result.length-1] = result[result.length-1] * 16 + mapping[c]
                }
                cnt += 1;
              }
              return result;
            };
            let a9DeviceInfo = "64 00 11 00 00 00 64 00 14 53 00 6f 00 6e 00 79" +
                "00 20 00 50 00 54 00 50 00 20 00 45 00 78 00 74" +
                "00 65 00 6e 00 73 00 69 00 6f 00 6e 00 73 00 00" +
                "00 00 00 18 00 00 00 01 10 02 10 03 10 04 10 05" +
                "10 06 10 07 10 08 10 09 10 0a 10 1b 10 01 92 02" +
                "92 05 92 07 92 09 92 0a 92 0b 92 0c 92 0d 92 01" +
                "98 02 98 03 98 05 98 07 00 00 00 01 c2 02 c2 03" +
                "c2 04 c2 05 c2 06 c2 07 c2 00 00 00 00 00 00 00" +
                "00 03 00 00 00 01 38 01 b3 01 b1 11 53 00 6f 00" +
                "6e 00 79 00 20 00 43 00 6f 00 72 00 70 00 6f 00" +
                "72 00 61 00 74 00 69 00 6f 00 6e 00 00 00 07 49" +
                "00 4c 00 43 00 45 00 2d 00 39 00 00 00 05 36 00" +
                "2e 00 30 00 30 00 00 00 21 30 00 30 00 30 00 30" +
                "00 30 00 30 00 30 00 30 00 30 00 30 00 30 00 30" +
                "00 30 00 30 00 30 00 30 00 33 00 32 00 38 00 32" +
                "00 38 00 39 00 33 00 30 00 30 00 33 00 37 00 37" +
                "00 37 00 39 00 38 00 32 00 00 00 0c 00 00 00 0c" +
                "00 00 00 01 00 00 00 0e 00 00 00 07 00 00 00 01" +
                "20 01 00 00 00"
            let a9DeviceInfoPayload = dataFactory.create(toBytes(a9DeviceInfo));

            console.log(a9DeviceInfoPayload);

            let handleCmdRequest = function (request) {
                var data;

                switch (request.opCode) {
                    case packet.requestTypes.openSession:
                        console.log("Received Open_Session", request);
                        data = packet.createOpenSessionAck(request.transactionId)
                        socket.write(data.buffer)
                        console.log("Sending Open_Session_Response in response");
                        break;
                    case packet.requestTypes.getDeviceInfo:
                        console.log("Received Get_Device_Info, request");
                        data = packet.createStartDataPacket(request.sessionId, 267);
                        socket.write(data.buffer);
                        console.log("Sending Start_Data_Packet in response");
                        data = packet.createDataPacket(request.sessionId, a9DeviceInfoPayload, 279);
                        socket.write(data.buffer);
                        console.log("Sending Data_Packet in response");
                        break;
                    default:
                        console.log("Unknown Command Request packet", request);
                }
            };

            for (var request of packets) {
                switch (request.type) {
                    case packet.types.initCommandRequest:
                        handleInitCommandRequest(request);
                        break;
                    case packet.types.initEventRequest:
                        handleInitEventRequest(request);
                        break;
                    case packet.types.cmdRequest:
                        handleCmdRequest(request);
                        break;
                    default:
                        console.log("Unknown packet type", request);
                }
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
