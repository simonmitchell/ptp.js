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
            let a9DeviceInfoPayload = dataFactory.create(toBytes(
                "64 00 11 00 00 00 64 00 14 53 00 6f 00 6e 00 79" +
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
                "20 01 00 00 00"));

            let sdioConnectPayload = dataFactory.create(toBytes(
                "00 00 00 00 00 00 00 00 0c 00 00 00 0c 00 00 00" +
                "02 00 00 00 0e 00 00 00 07 00 00 00 01 20 02 00" +
                "00 00"));

            let sdioGetExtDeviceInfoPayload = dataFactory.create(toBytes(
              "2c 01 48 00 00 00 05 50 07 50 0a 50 0b 50 0c 50" +
              "0e 50 10 50 13 50 00 d2 01 d2 03 d2 0d d2 0e d2" +
              "0f d2 10 d2 11 d2 13 d2 14 d2 15 d2 17 d2 18 d2" +
              "1b d2 1c d2 1d d2 1e d2 1f d2 21 d2 22 d2 23 d2" +
              "2a d2 2c d2 31 d2 35 d2 36 d2 3e d2 3f d2 40 d2" +
              "41 d2 42 d2 43 d2 44 d2 45 d2 46 d2 47 d2 48 d2" +
              "49 d2 4a d2 4c d2 4e d2 4f d2 50 d2 51 d2 52 d2" +
              "53 d2 54 d2 55 d2 56 d2 57 d2 58 d2 59 d2 5a d2" +
              "5b d2 5c d2 5d d2 5f d2 60 d2 61 d2 62 d2 63 d2" +
              "64 d2 67 d2 78 d2 16 00 00 00 c1 d2 c2 d2 c3 d2" +
              "c7 d2 c8 d2 c9 d2 ca d2 cd d2 ce d2 cf d2 d0 d2" +
              "d1 d2 d2 d2 d5 d2 d6 d2 d7 d2 d8 d2 d9 d2 da d2" +
              "db d2 dc d2 dd d2 0c 00 00 00 0c 00 00 00 04 00" +
              "00 00"));

            let handleCmdRequest = function (request) {
                var data;

                switch (request.opCode) {
                    case packet.requestTypes.openSession:
                        console.log("Received Open_Session", request);
                        data = packet.createOpenSessionAck(request.transactionId)
                        socket.write(data.buffer)
                        console.log("Sending Open_Session_Response in response");
                        break;
                    case packet.requestTypes.closeSession:
                        console.log("Received Close_Session", request);
                        break;
                    case packet.requestTypes.getDeviceInfo:
                        console.log("Received Get_Device_Info", request);
                        data = packet.createStartDataPacket(request.sessionId, 267);
                        socket.write(data.buffer);
                        console.log("Sending Start_Data_Packet in response");
                        data = packet.createDataPacket(request.sessionId, a9DeviceInfoPayload, 279);
                        socket.write(data.buffer);
                        console.log("Sending Data_Packet in response");
                        break;
                    case packet.requestTypes.sdioConnect:
                        console.log("Received SDIO_Connect request", request);
                        data = packet.createStartDataPacket(request.sessionId, 8);
                        socket.write(data.buffer);
                        console.log("Sending Start_Data_Packet in response");
                        data = packet.createDataPacket(request.sessionId, sdioConnectPayload, 20);
                        socket.write(data.buffer);
                        console.log("Sending Data_Packet in response");
                        break;
                    case packet.requestTypes.sdioGetExtDeviceInfo:
                        console.log("Received SDIO_Get_Ext_Device_Info request", request);
                        data = packet.createStartDataPacket(request.sessionId, 198);
                        socket.write(data.buffer);
                        console.log("Sending Start_Data_Packet in response");
                        data = packet.createDataPacket(request.sessionId, sdioGetExtDeviceInfoPayload, 210);
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
