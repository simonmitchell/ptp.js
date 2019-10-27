/*jslint browser: true, maxerr: 50, maxlen: 80 */

/*global define, Uint8Array */

define(['./packet', './loop-factory', './data-factory', './device-prop-codes'], function (packet, loopFactory, dataFactory, deviceProps) {
    'use strict';

    var onInitialized,
        clientGuid = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        clientName = '',
        operationCodes,
        cmdResponseCallbacks = {}, // by transaction ID
        startDataPacketCallbacks = {}, // by transaction ID
        dataPacketCallbacks = {}, // by transaction ID
        endDataPacketCallbacks = {}, // by transaction ID
        loop = loopFactory.create('main'),
        sessionId,
        openSessionId,
        openSession,
        onSessionOpened;

    operationCodes = {
        'undefined': 0x1000,
        getDeviceInfo: 0x1001,
        openSession: 0x1002,
        closeSession: 0x1003,
        getStorageIds: 0x1004,
        getStorageInfo: 0x1005,
        getNumObjects: 0x1006,
        getObjectHandles: 0x1007,
        getObjectInfo: 0x1008,
        getObject: 0x1009,
        getThumb: 0x100a,
        deleteObject: 0x100b,
        sendObjectInfo: 0x100c,
        sendObject: 0x100d,
        initiateCapture: 0x100e,
        formatStore: 0x100f,
        resetDevice: 0x1010,
        selfTest: 0x1011,
        setObjectProtection: 0x1012,
        powerDown: 0x1013,
        getDevicePropDesc: 0x1014,
        getDevicePropValue: 0x1015,
        setDevicePropValue: 0x1016,
        resetDevicePropValue: 0x1017,
        terminateOpenCapture: 0x1018,
        moveObject: 0x1019,
        copyObject: 0x101a,
        getPartialObject: 0x101b,
        initiateOpenCapture: 0x101c,
        okay: 0x2001,
        sdioConnect: 0x9201,
        sdioGetExtDeviceInfo: 0x9202,
        sonyGetDevicePropDesc: 0x9203,
        sonyGetDevicePropValue: 0x9204,
        setControlDeviceA: 0x9205,
        getControlDeviceDesc: 0x9206,
        setControlDeviceB: 0x9207,
        getAllDevicePropData: 0x9209,

        unknownHandshakeRequest: 0x920D,
    };

    Object.freeze(operationCodes);

    loop.onDataCallbacks[packet.types.initCommandAck] = function (content) {
        sessionId = content.sessionId;
        onInitialized();
    };

    openSession = function () {
        cmdResponseCallbacks[packet.transactionId] = function (content) {
            if (content.responseCode === loop.responseCodes.ok) {
                onSessionOpened();
            }
        };
        loop.scheduleSend(packet.createCmdRequest(operationCodes.openSession,
                                                  [sessionId]));
    };

    loop.onSocketOpened = function () {
        loop.scheduleSend(packet.createInitCommandRequest(clientGuid,
                                                          clientName));
    };

    loop.onDataCallbacks[packet.types.cmdRequest] = function (request) {

        var data, dataContainer, hexString;

        switch (request.opCode) {
            case operationCodes.openSession: 
                openSessionId = request.sessionId;
                loop.scheduleSend(packet.createCmdResponse(operationCodes.okay, request.transactionId));
            break;
            case operationCodes.getDeviceInfo:

                hexString = "64 00 11 00 00 00 64 00 14 53 00 6f 00 6e 00 79" +
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
                    "00 37 00 39 00 38 00 32 00 00 00";
                let a9DeviceInfoPayload = dataFactory.createFromHexString(hexString);

                console.log("Received Get_Device_Info", request);
                dataContainer = packet.createDataContainer(request.sessionId, a9DeviceInfoPayload);
                for (var data of dataContainer) {
                  loop.scheduleSend(data);
                }
                loop.scheduleSend(packet.createCmdResponse(operationCodes.okay, request.transactionId));
            break;
            case operationCodes.sdioConnect:

                hexString = "00 00 00 00 00 00 00 00";
                let sdioConnectPayload = dataFactory.createFromHexString(hexString);

                dataContainer = packet.createDataContainer(request.sessionId, sdioConnectPayload);
                for (var data of dataContainer) {
                  loop.scheduleSend(data);
                }
                loop.scheduleSend(packet.createCmdResponse(operationCodes.okay, request.transactionId));
            break;
            case operationCodes.sdioGetExtDeviceInfo:

                hexString = "2c 01 48 00 00 00 05 50 07 50 0a 50 0b 50 0c 50" +
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
                    "db d2 dc d2 dd d2";
                let sdioGetExtDeviceInfoPayload = dataFactory.createFromHexString(hexString);

                dataContainer = packet.createDataContainer(request.sessionId, sdioGetExtDeviceInfoPayload);
                for (var data of dataContainer) {
                  loop.scheduleSend(data);
                }

                // TODO(gswirski): this is not needed to establish connection
                // but brings Wireshark sessions in-line with what I saw on a9

                // data = packet.createEventPacket();
                // namedSockets['event'].write(data.buffer);

                loop.scheduleSend(packet.createCmdResponse(operationCodes.okay, request.transactionId));
            break;
            case operationCodes.getAllDevicePropData:

                // TODO(gswirski): this should be relatively easy to break
                // down once we know how to handle single properties
                hexString = "48 00 00 00 00 00 00 00 05 50 04 00 01 01 00 00" +
                    "02 00 02 0f 00 02 00 04 00 11 80 10 80 06 00 01" +
                    "80 02 80 03 80 04 80 07 00 30 80 12 80 20 80 21" +
                    "80 22 80 0f 00 02 00 04 00 11 80 10 80 06 00 01" +
                    "80 02 80 03 80 04 80 07 00 30 80 12 80 20 80 21" +
                    "80 22 80 07 50 04 00 01 01 ff ff 18 01 02 13 00" +
                    "18 01 40 01 5e 01 90 01 c2 01 f4 01 30 02 76 02" +
                    "c6 02 20 03 84 03 e8 03 4c 04 14 05 78 05 40 06" +
                    "08 07 d0 07 98 08 13 00 18 01 40 01 5e 01 90 01" +
                    "c2 01 f4 01 30 02 76 02 c6 02 20 03 84 03 e8 03" +
                    "4c 04 14 05 78 05 40 06 08 07 d0 07 98 08 0a 50" +
                    "04 00 01 02 00 00 04 80 02 04 00 02 00 04 80 06" +
                    "80 01 00 04 00 02 00 04 80 06 80 01 00 0b 50 04" +
                    "00 01 01 00 00 01 80 02 06 00 01 80 02 80 04 80" +
                    "05 80 03 80 06 80 06 00 01 80 02 80 04 80 05 80" +
                    "03 80 06 80 0c 50 04 00 01 01 00 00 03 00 02 03" +
                    "00 03 00 01 80 03 80 05 00 02 00 01 00 03 00 01" +
                    "80 03 80 0e 50 06 00 01 02 00 00 00 00 03 00 02" +
                    "00 02 0d 00 02 00 01 00 03 00 02 00 04 00 03 00" +
                    "01 00 00 00 50 80 07 00 51 80 07 00 52 80 07 00" +
                    "53 80 07 00 59 80 09 00 5a 80 09 00 5b 80 09 00" +
                    "5c 80 09 00 00 80 04 00 0d 00 02 00 01 00 03 00" +
                    "02 00 04 00 03 00 01 00 00 00 50 80 07 00 51 80" +
                    "07 00 52 80 07 00 53 80 07 00 59 80 09 00 5a 80" +
                    "09 00 5b 80 09 00 5c 80 09 00 00 80 04 00 10 50" +
                    "03 00 01 01 00 00 00 00 02 1f 00 88 13 5c 12 cc" +
                    "10 a0 0f 74 0e e4 0c b8 0b 8c 0a fc 08 d0 07 a4" +
                    "06 14 05 e8 03 bc 02 2c 01 00 00 d4 fe 44 fd 18" +
                    "fc ec fa 5c f9 30 f8 04 f7 74 f5 48 f4 1c f3 8c" +
                    "f1 60 f0 34 ef a4 ed 78 ec 1f 00 88 13 5c 12 cc" +
                    "10 a0 0f 74 0e e4 0c b8 0b 8c 0a fc 08 d0 07 a4" +
                    "06 14 05 e8 03 bc 02 2c 01 00 00 d4 fe 44 fd 18" +
                    "fc ec fa 5c f9 30 f8 04 f7 74 f5 48 f4 1c f3 8c" +
                    "f1 60 f0 34 ef a4 ed 78 ec 13 50 06 00 01 02 00" +
                    "00 00 00 02 00 01 00 02 31 00 01 00 00 00 12 80" +
                    "01 00 15 80 01 00 02 00 01 00 04 80 03 00 03 80" +
                    "03 00 05 80 03 00 08 80 08 00 09 80 08 00 0c 80" +
                    "08 00 0d 80 08 00 0e 80 08 00 0f 80 08 00 37 83" +
                    "04 00 37 85 04 00 37 89 04 00 57 83 04 00 57 85" +
                    "04 00 57 89 04 00 77 83 04 00 77 85 04 00 77 89" +
                    "04 00 11 83 04 00 11 85 04 00 11 89 04 00 21 83" +
                    "04 00 21 85 04 00 31 83 04 00 31 85 04 00 36 83" +
                    "05 00 36 85 05 00 36 89 05 00 56 83 05 00 56 85" +
                    "05 00 56 89 05 00 76 83 05 00 76 85 05 00 76 89" +
                    "05 00 10 83 05 00 10 85 05 00 10 89 05 00 20 83" +
                    "05 00 20 85 05 00 30 83 05 00 30 85 05 00 28 80" +
                    "06 00 18 80 06 00 29 80 07 00 19 80 07 00 31 00" +
                    "01 00 00 00 12 80 01 00 15 80 01 00 02 00 01 00" +
                    "04 80 03 00 03 80 03 00 05 80 03 00 08 80 08 00" +
                    "09 80 08 00 0c 80 08 00 0d 80 08 00 0e 80 08 00" +
                    "0f 80 08 00 37 83 04 00 37 85 04 00 37 89 04 00" +
                    "57 83 04 00 57 85 04 00 57 89 04 00 77 83 04 00" +
                    "77 85 04 00 77 89 04 00 11 83 04 00 11 85 04 00" +
                    "11 89 04 00 21 83 04 00 21 85 04 00 31 83 04 00" +
                    "31 85 04 00 36 83 05 00 36 85 05 00 36 89 05 00" +
                    "56 83 05 00 56 85 05 00 56 89 05 00 76 83 05 00" +
                    "76 85 05 00 76 89 05 00 10 83 05 00 10 85 05 00" +
                    "10 89 05 00 20 83 05 00 20 85 05 00 30 83 05 00" +
                    "30 85 05 00 28 80 06 00 18 80 06 00 29 80 07 00" +
                    "19 80 07 00 00 d2 03 00 01 01 00 00 00 00 02 13" +
                    "00 b8 0b 8c 0a fc 08 d0 07 a4 06 14 05 e8 03 bc" +
                    "02 2c 01 00 00 d4 fe 44 fd 18 fc ec fa 5c f9 30" +
                    "f8 04 f7 74 f5 48 f4 13 00 b8 0b 8c 0a fc 08 d0" +
                    "07 a4 06 14 05 e8 03 bc 02 2c 01 00 00 d4 fe 44" +
                    "fd 18 fc ec fa 5c f9 30 f8 04 f7 74 f5 48 f4 01" +
                    "d2 02 00 01 01 00 01 02 07 00 01 1f 11 12 13 14" +
                    "15 0e 00 01 1f 11 12 13 14 15 20 21 22 23 24 25" +
                    "26 03 d2 02 00 01 01 00 01 02 03 00 01 02 03 03" +
                    "00 01 02 03 0d d2 06 00 01 02 ff ff ff ff 28 00" +
                    "01 00 02 37 00 0a 00 2c 01 0a 00 fa 00 0a 00 c8" +
                    "00 0a 00 96 00 0a 00 82 00 0a 00 64 00 0a 00 50" +
                    "00 0a 00 3c 00 0a 00 32 00 0a 00 28 00 0a 00 20" +
                    "00 0a 00 19 00 0a 00 14 00 0a 00 10 00 0a 00 0d" +
                    "00 0a 00 0a 00 0a 00 08 00 0a 00 06 00 0a 00 05" +
                    "00 0a 00 04 00 03 00 01 00 04 00 01 00 05 00 01" +
                    "00 06 00 01 00 08 00 01 00 0a 00 01 00 0d 00 01" +
                    "00 0f 00 01 00 14 00 01 00 19 00 01 00 1e 00 01" +
                    "00 28 00 01 00 32 00 01 00 3c 00 01 00 50 00 01" +
                    "00 64 00 01 00 7d 00 01 00 a0 00 01 00 c8 00 01" +
                    "00 fa 00 01 00 40 01 01 00 90 01 01 00 f4 01 01" +
                    "00 80 02 01 00 20 03 01 00 e8 03 01 00 e2 04 01" +
                    "00 40 06 01 00 d0 07 01 00 c4 09 01 00 80 0c 01" +
                    "00 a0 0f 01 00 88 13 01 00 00 19 01 00 40 1f 01" +
                    "00 37 00 0a 00 2c 01 0a 00 fa 00 0a 00 c8 00 0a" +
                    "00 96 00 0a 00 82 00 0a 00 64 00 0a 00 50 00 0a" +
                    "00 3c 00 0a 00 32 00 0a 00 28 00 0a 00 20 00 0a" +
                    "00 19 00 0a 00 14 00 0a 00 10 00 0a 00 0d 00 0a" +
                    "00 0a 00 0a 00 08 00 0a 00 06 00 0a 00 05 00 0a" +
                    "00 04 00 03 00 01 00 04 00 01 00 05 00 01 00 06" +
                    "00 01 00 08 00 01 00 0a 00 01 00 0d" +
                    "00 01 00 0f 00 01 00 14 00 01 00 19" +
                    "00 01 00 1e 00 01 00 28 00 01 00 32 00 01 00 3c" +
                    "00 01 00 50 00 01 00 64 00 01 00 7d 00 01 00 a0" +
                    "00 01 00 c8 00 01 00 fa 00 01 00 40 01 01 00 90" +
                    "01 01 00 f4 01 01 00 80 02 01 00 20 03 01 00 e8" +
                    "03 01 00 e2 04 01 00 40 06 01 00 d0 07 01 00 c4" +
                    "09 01 00 80 0c 01 00 a0 0f 01 00 88 13 01 00 00" +
                    "19 01 00 40 1f 01 00 0e d2 02 00 00 01 00 06 02" +
                    "00 00 00 00 0f d2 04 00 01 00 00 00 c4 09 01 c4" +
                    "09 ac 26 64 00 10 d2 02 00 01 01 00 c0 01 a4 dc" +
                    "01 11 d2 02 00 01 01 00 01 02 03 00 01 02 04 03" +
                    "00 01 02 04 13 d2 02 00 00 01 00 01 02 00 00 00" +
                    "00 14 d2 06 00 00 01 ff ff ff ff ff ff ff ff 01" +
                    "00 00 00 00 ff ff ff ff 01 00 00 00 15 d2 04 00" +
                    "00 01 00 00 00 00 01 00 00 ff ff 01 00 17 d2 02" +
                    "00 00 01 00 01 02 00 00 00 00 18 d2 01 00 00 01" +
                    "00 35 01 ff 64 01 1b d2 04 00 01 02 00 00 00 80" +
                    "02 01 00 00 80 11 00 00 80 01 80 02 80 03 80 04" +
                    "80 05 80 10 80 20 80 21 80 30 80 40 80 50 80 51" +
                    "80 52 80 53 80 60 80 90 80 1c d2 02 00 01 01 00" +
                    "c0 01 a4 dc 02 1d d2 02 00 00 02 00 00 01 00 02" +
                    "01 1e d2 06 00 01 01 ff ff ff 00 ff ff ff 00 02" +
                    "26 00 ff ff ff 00 32 00 00 10 40 00 00 10 50 00" +
                    "00 10 64 00 00 00 7d 00 00 00 a0 00 00 00 c8 00" +
                    "00 00 fa 00 00 00 40 01 00 00 90 01 00 00 f4 01" +
                    "00 00 80 02 00 00 20 03 00 00 e8 03 00 00 e2 04" +
                    "00 00 40 06 00 00 d0 07 00 00 c4 09 00 00 80 0c" +
                    "00 00 a0 0f 00 00 88 13 00 00 00 19 00 00 40 1f" +
                    "00 00 10 27 00 00 00 32 00 00 80 3e 00 00 20 4e" +
                    "00 00 00 64 00 00 00 7d 00 00 40 9c 00 00 00 c8" +
                    "00 00 00 fa 00 10 80 38 01 10 00 90 01 10 00 f4" +
                    "01 10 00 71 02 10 00 20 03 10 26 00 ff ff ff 00" +
                    "32 00 00 10 40 00 00 10 50 00 00 10 64 00 00 00" +
                    "7d 00 00 00 a0 00 00 00 c8 00 00 00 fa 00 00 00" +
                    "40 01 00 00 90 01 00 00 f4 01 00 00 80 02 00 00" +
                    "20 03 00 00 e8 03 00 00 e2 04 00 00 40 06 00 00" +
                    "d0 07 00 00 c4 09 00 00 80 0c 00 00 a0 0f 00 00" +
                    "88 13 00 00 00 19 00 00 40 1f 00 00 10 27 00 00" +
                    "00 32 00 00 80 3e 00 00 20 4e 00 00 00 64 00 00" +
                    "00 7d 00 00 40 9c 00 00 00 c8 00 00 00 fa 00 10" +
                    "80 38 01 10 00 90 01 10 00 f4 01 10 00 71 02 10" +
                    "00 20 03 10 1f d2 02 00 00 01 00 01 02 00 00 00" +
                    "00 21 d2 02 00 00 01 00 01 02 00 00 00 00 22 d2" +
                    "04 00 01 01 00 00 01 00 02 03 00 01 00 11 00 10" +
                    "00 03 00 01 00 11 00 10 00 23 d2 ff ff 01 01 00" +
                    "00 00 2a d2 02 00 00 00 00 01 02 00 00 00 00 2c" +
                    "d2 04 00 01 01 00 00 06 02 02 0e 00 01 00 02 00" +
                    "03 00 01 01 02 01 03 01 04 01 01 02 02 02 03 02" +
                    "04 02 05 02 06 02 07 02 0e 00 01 00 02 00 03 00" +
                    "01 01 02 01 03 01 04 01 01 02 02 02 03 02 04 02" +
                    "05 02 06 02 07 02 31 d2 02 00 01 01 00 01 02 02" +
                    "00 01 02 02 00 01 02 35 d2 02 00 00 00 00 00 02" +
                    "02 00 00 01 02 00 00 01 36 d2 02 00 00 01 00 01" +
                    "02 02 00 00 01 02 00 00 01 3e d2 02 00 01 00 00" +
                    "00 02 00 00 00 00 3f d2 02 00 01 00 00 00 02 00" +
                    "00 00 00 40 d2 02 00 01 01 00 0e 02 13 00 01 02" +
                    "03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12" +
                    "13 13 00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d" +
                    "0e 0f 10 11 12 13 41 d2 02 00 01 01 00 08 02 03" +
                    "00 08 09 03 03 00 08 09 03 42 d2 04 00 01 01 00" +
                    "00 21 00 02 02 00 24 00 21 00 02 00 24 00 21 00" +
                    "43 d2 04 00 01 00 00 00 02 00 02 00 00 00 00 44" +
                    "d2 04 00 01 00 00 00 02 00 02 00 00 00 00 45 d2" +
                    "02 00 01 00 00 01 02 00 00 00 00 46 d2 02 00 01" +
                    "00 00 01 02 00 00 00 00 47 d2 02 00 01 01 00 00" +
                    "02 04 00 00 01 02 03 04 00 00 01 02 03 48 d2 02" +
                    "00 00 02 00 02 02 00 00 00 00 49 d2 06 00 00 00" +
                    "00 00 00 00 00 00 00 00 01 00 00 00 00 ff ff ff" +
                    "ff 01 00 00 00 4a d2 06 00 00 00 00 00 00 00 00" +
                    "00 00 00 01 00 00 00 00 ff ff ff ff 01 00 00 00" +
                    "4c d2 02 00 00 02 00 64 01 00 00 01 4e d2 04 00" +
                    "00 01 00 00 01 00 02 00 00 00 00 4f d2 02 00 01" +
                    "01 00 01 02 02 00 01 02 02 00 01 02 50 d2 02 00" +
                    "00 01 00 00 02 00 00 00 00 51 d2 02 00 00 02 00" +
                    "00 01 00 02 01 52 d2 02 00 01 01 00 01 02 03 00" +
                    "01 02 03 03 00 01 02 03 53 d2 02 00 01 01 00 01" +
                    "02 03 00 01 02 03 03 00 01 02 03 54 d2 08 00 01" +
                    "02 00 00 00 00 00 00 00 00 f0 00 40 01 00 00 00" +
                    "00 02 00 00 04 00 ff ff ff ff 00 00 00 00 ff ff" +
                    "ff ff 0a 00 00 00 ff ff ff ff 2f 00 00 00 ff ff" +
                    "ff ff 5e 00 00 00 55 d2 02 00 01 01 00 04 02 05" +
                    "00 05 04 03 02 01 05 00 05 04 03 02 01 56 d2 02" +
                    "00 00 00 00 04 02 00 00 00 00 57 d2 06 00 00 00" +
                    "00 00 00 00 00 00 00 00 01 00 00 00 00 ff ff ff" +
                    "ff 01 00 00 00 58 d2 06 00 00 00 00 00 00 00 00" +
                    "00 00 00 01 00 00 00 00 ff ff ff ff 01 00 00 00" +
                    "59 d2 02 00 01 02 00 01 02 00 00 00 00 5a d2 02" +
                    "00 01 01 00 00 02 02 00 00 01 02 00 00 01 5b d2" +
                    "02 00 00 00 00 00 02 02 00 00 01 02 00 00 01 5c" +
                    "d2 06 00 01 00 00 00 00 00 e8 03 00 00 01 e8 03" +
                    "00 00 e8 03 00 00 64 00 00 00 5d d2" +
                    "06 00 00 00 00 00 00 00 00 00 00 01" +
                    "00 5f d2 02 00 01 02 00 01 02 00 00 00 00 60 d2" +
                    "02 00 00 00 00 01 02 00 00 00 00 61 d2 06 00 00" +
                    "00 00 00 00 00 00 00 00 00 01 00 00 00 00 ff ff" +
                    "ff ff 01 00 00 00 62 d2 02 00 01 01 00 00 02 02" +
                    "00 01 00 02 00 01 00 63 d2 02 00 01 01 00 00 02" +
                    "02 00 01 00 02 00 01 00 64 d2 02 00 00 01 00 00" +
                    "02 00 00 00 00 67 d2 06 00 00 01 00 00 00 00 00" +
                    "00 00 00 01 00 00 00 00 e0 01 80 02 01 00 00 00" +
                    "78 d2 ff ff 00 02 00 62 68 00 74 00 74 00 70 00" +
                    "3a 00 2f 00 2f 00 31 00 39 00 32 00 2e 00 31 00" +
                    "36 00 38 00 2e 00 31 00 32 00 32 00 2e 00 31 00" +
                    "3a 00 36 00 30 00 31 00 35 00 32 00 2f 00 6c 00" +
                    "69 00 76 00 65 00 76 00 69 00 65 00 77 00 73 00" +
                    "74 00 72 00 65 00 61 00 6d 00 3f 00 25 00 32 00" +
                    "31 00 31 00 32 00 33 00 34 00 25 00 32 00 31 00" +
                    "25 00 32 00 61 00 25 00 33 00 61 00 25 00 32 00" +
                    "61 00 25 00 33 00 61 00 69 00 6d 00 61 00 67 00" +
                    "65 00 25 00 32 00 66 00 6a 00 70 00 65 00 67 00" +
                    "25 00 33 00 61 00 25 00 32 00 61 00 25 00 32 00" +
                    "31 00 25 00 32 00 31 00 25 00 32 00 31 00 25 00" +
                    "32 00 31 00 25 00 32 00 31 00 00 00 00";
                let allDevicePropDataPayload = dataFactory.createFromHexString(hexString)
                console.log("Received Get_All_Device_Prop_Data request", request);

                dataContainer = packet.createDataContainer(request.sessionId, allDevicePropDataPayload);
                for (var data of dataContainer) {
                  loop.scheduleSend(data);
                }

                loop.scheduleSend(packet.createCmdResponse(operationCodes.okay, request.transactionId));
            break;
            case operationCodes.unknownHandshakeRequest:
                hexString = "81 00 00 00 00";
                let unknownHandshakePayload = dataFactory.createFromHexString(hexString)

                console.log("Received 0x920D request", request);

                dataContainer = packet.createDataContainer(request.sessionId, unknownHandshakePayload);
                for (var data of dataContainer) {
                  loop.scheduleSend(data);
                }

                loop.scheduleSend(packet.createCmdResponse(operationCodes.okay, request.transactionId));
            break;
            case operationCodes.setControlDeviceA:
                console.log("Received setControlDeviceA", request);

                var propertyCode = request.argsData.getWord(0);
                if (propertyCode == deviceProps.fNumber) {
                    console.log("Trying to set FNumber");

                    startDataPacketCallbacks[request.transactionId] = function (content) {
                        // do nothing
                    };
                    dataPacketCallbacks[request.transactionId] = function (content) {
                        var value = content.payloadData.getWord(0);
                        console.log("setting", value);
                    };
                    endDataPacketCallbacks[request.transactionId] = function (content) {
                        // do nothing
                    };
                }

                loop.scheduleSend(packet.createCmdResponse(operationCodes.okay, request.transactionId));
            break;
            default:
                console.log("Got unknown opcode request", request.opCode);

        }
    };

    loop.onDataCallbacks[packet.types.cmdResponse] = function (content) {
        var callback = cmdResponseCallbacks[content.transactionId];

        if (callback !== undefined) {
            callback(content);
            delete cmdResponseCallbacks[content.transactionId];
        }
    };

    loop.onDataCallbacks[packet.types.startDataPacket] = function (content) {
        var callback = startDataPacketCallbacks[content.transactionId];

        if (callback !== undefined) {
            callback(content);
            delete startDataPacketCallbacks[content.transactionId];
        }
    };

    loop.onDataCallbacks[packet.types.dataPacket] = function (content) {
        var callback = dataPacketCallbacks[content.transactionId];

        if (callback !== undefined) {
            callback(content);
        }
    };

    loop.onDataCallbacks[packet.types.endDataPacket] = function (content) {
        var callback = endDataPacketCallbacks[content.transactionId];

        if (callback !== undefined) {
            callback(content);
            delete endDataPacketCallbacks[content.transactionId];
        }
        delete dataPacketCallbacks[content.transactionId];
    };

    return Object.create(null, {
        initialize: {value: loop.openSocket},
        onInitialized: {set: function (x) {
            onInitialized = x;
        }},
        onDisconnected: {set: function (x) {
            loop.onDisconnected = x;
        }},
        onError: {set: function (x) {
            loop.onError = x;
        }},
        scheduleSend: {value: loop.scheduleSend},
        clientGuid: {set: function (x) {
            clientGuid = x;
        }},
        clientName: {set: function (x) {
            clientName = x;
        }},
        sessionId: {
            set: function(x) {
                sessionId = x;
            },
            get: function () {
                return sessionId;
            }
        },
        onSessionOpened: {set: function (x) {
            onSessionOpened = x;
        }},
        openSession: {value: openSession},
        operationCodes: {get: function () {
            return operationCodes;
        }},
        responseCodes: {get: function () {
            return loop.responseCodes;
        }},
        cmdResponseCallbacks: {get: function () {
            return cmdResponseCallbacks;
        }},
        startDataPacketCallbacks: {get: function () {
            return startDataPacketCallbacks;
        }},
        dataPacketCallbacks: {get: function () {
            return dataPacketCallbacks;
        }},
        endDataPacketCallbacks: {get: function () {
            return endDataPacketCallbacks;
        }},
        stop: {value: loop.stop}
    });
});
