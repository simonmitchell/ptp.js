/*jslint browser: true, maxerr: 50, maxlen: 80 */

/*global define, Uint8Array */

define(['./packet', './loop-factory', './data-factory'], function (packet, loopFactory, dataFactory) {
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

        var data, hexString;

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
                    "00 37 00 39 00 38 00 32 00 00 00 0c 00 00 00 0c" +
                    "00 00 00 01 00 00 00 0e 00 00 00 07 00 00 00 01" +
                    "20 01 00 00 00";
                let a9DeviceInfoPayload = dataFactory.createFromHexString(hexString);

                console.log("Received Get_Device_Info", request);
                //@simon TODO: work out why we can't send the actual data length here!
                data = packet.createStartDataPacket(request.transactionId, 267/*a9DeviceInfoPayload.length*/);
                loop.scheduleSend(data);
                console.log("Sending Start_Data_Packet in response");
                data = packet.createDataPacket(request.transactionId, a9DeviceInfoPayload, 279);
                loop.scheduleSend(data);
                console.log("Sending Data_Packet in response");
            break;
            case operationCodes.sdioConnect:

                hexString = "00 00 00 00 00 00 00 00 0c 00 00 00 0c 00 00 00" +
                    "02 00 00 00 0e 00 00 00 07 00 00 00 01 20 02 00" +
                    "00 00";

                let sdioConnectPayload = dataFactory.createFromHexString(hexString);

                console.log("Received SDIO_Connect request", request);
                data = packet.createStartDataPacket(request.transactionId, 8/*sdioConnectPayload.length*/);
                loop.scheduleSend(data);
                console.log("Sending Start_Data_Packet in response");
                data = packet.createDataPacket(request.transactionId, sdioConnectPayload, 20);
                loop.scheduleSend(data);
                console.log("Sending Data_Packet in response");
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
                    "db d2 dc d2 dd d2 0c 00 00 00 0c 00 00 00 04 00" +
                    "00 00";

                let sdioGetExtDeviceInfoPayload = dataFactory.createFromHexString(hexString);

                console.log("Received SDIO_Get_Ext_Device_Info request", request);
                data = packet.createStartDataPacket(request.transactionId, 198/*sdioGetExtDeviceInfoPayload.length*/);
                loop.scheduleSend(data);
                console.log("Sending Start_Data_Packet in response");
                data = packet.createDataPacket(request.transactionId, sdioGetExtDeviceInfoPayload, 210);
                loop.scheduleSend(data);
                console.log("Sending Data_Packet in response");
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
