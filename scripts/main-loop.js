/*jslint browser: true, maxerr: 50, maxlen: 80 */

/*global define, Uint8Array */

define(['./packet', './event-loop', './loop-factory', './data-factory', './device-prop-codes', './device-prop-types', './camera'], function (packet, eventLoop, loopFactory, dataFactory, deviceProps, devicePropTypes, device) {
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
        onSessionOpened,
        responseCodes,
        serverState = {};

    serverState = {
      fNumber: 280,
      driveMode: 0x00000001
    };

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
        sdioConnect: 0x9201,
        sdioGetExtDeviceInfo: 0x9202,
        sonyGetDevicePropDesc: 0x9203,
        sonyGetDevicePropValue: 0x9204,
        setControlDeviceA: 0x9205,
        getControlDeviceDesc: 0x9206,
        setControlDeviceB: 0x9207,
        getAllDevicePropData: 0x9209,

        unknownHandshakeRequest: 0x920D
    };

    responseCodes = {
        ok: 0x2001,
        generalError: 0x2002,
        sessionNotOpen: 0x2003,
        devicePropNotSupported: 0x200A
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
                loop.scheduleSend(packet.createCmdResponse(responseCodes.ok, request.transactionId));
            break;
            case operationCodes.getDeviceInfo:

                hexString = "64 00" + // Standard Version (100)
                    "11 00 00 00" + // Vendor Extension ID
                    "64 00" + // VendorExtensionVersion

                    "14" + // 20 characters!
                    "53 00 6f 00 6e 00 79 00" + // VendorExtensionDesc ("Sony PTP Extensions")
                    "20 00 50 00 54 00 50 00 20 00 45 00 78 00 74 00" +
                    "65 00 6e 00 73 00 69 00 6f 00 6e 00 73 00 00 00" +

                    "00 00" + // FunctionalMode

                    "18 00 00 00" + // Number of items in OperationsSupported (24)
                    "01 10 02 10 03 10 04 10 05" +
                    "10 06 10 07 10 08 10 09 10 0a 10 1b 10 01 92 02" +
                    "92 05 92 07 92 09 92 0a 92 0b 92 0c 92 0d 92 01" +
                    "98 02 98 03 98 05 98" + 

                    "07 00 00 00" + // Number of items in EventsSupported (7)
                    "01 c2 02 c2 03 c2 04 c2 05 c2 06 c2 07 c2" + 

                    "00 00 00 00" + // Number of device properties supported 
                    "00 00 00 00" + // Number of capture formats
                    "03 00 00 00" + // Number of image formats supported  
                    // 0x3801 = JPEG, 0xb301 = ???, 0xb101 = ???
                    "01 38 01 b3 01 b1" +

                    "11" + // Manufacturer length (16)

                    "53 00 6f 00" +
                    "6e 00 79 00 20 00 43 00 6f 00 72 00 70 00 6f 00" +
                    "72 00 61 00 74 00 69 00 6f 00 6e 00 00 00" +

                    "07" + // Model length (7)
                    "49 00 4c 00 43 00 45 00 2d 00 39 00 00 00" +

                    "05" + // Device Version Length (5)
                    "36 00 2e 00 30 00 30 00 00 00" +

                    "21" + // Serial number (33)
                    "30 00 30 00 30 00 30 00" +
                    "30 00 30 00 30 00 30 00 30 00 30 00 30 00 30 00" +
                    "30 00 30 00 30 00 30 00 33 00 32 00 38 00 32 00" +
                    "38 00 39 00 33 00 30 00 30 00 33 00 37 00 37 00" +
                    "37 00 39 00 38 00 32 00 00 00";
                let a9DeviceInfoPayload = dataFactory.createFromHexString(hexString);

                console.log("Received Get_Device_Info", request);
                dataContainer = packet.createDataContainer(request.transactionId, a9DeviceInfoPayload);
                for (var data of dataContainer) {
                  loop.scheduleSend(data);
                }
                loop.scheduleSend(packet.createCmdResponse(responseCodes.ok, request.transactionId));
            break;
            case operationCodes.sdioConnect:

                hexString = "00 00 00 00 00 00 00 00";
                let sdioConnectPayload = dataFactory.createFromHexString(hexString);
                console.log("Received SDIO_Connect", request);
                dataContainer = packet.createDataContainer(request.transactionId, sdioConnectPayload);
                for (var data of dataContainer) {
                  loop.scheduleSend(data);
                }
                loop.scheduleSend(packet.createCmdResponse(responseCodes.ok, request.transactionId));
            break;
            case operationCodes.sdioGetExtDeviceInfo:
                // this list contains all available property codes starting with 0x5005 and
                // ending with 0xd2dd
                hexString = "2c 01" +
                    "48 00 00 00" + // 72 distinct property codes
                    "05 50" + // White balance
                    "07 50" + // F Number
                    "0a 50" + // Focus Mode
                    "0b 50" + // Exposure metering
                    "0c 50" + // Flash mode
                    "0e 50" + // Exposure programme mode
                    "10 50" + // Exposure bias compensation
                    "13 50" + // Still capture mode
                    "00 d2" + // DPC Compensation
                    "01 d2" + // DRO Optimize
                    "03 d2" + // Image Size
                    "0d d2" + // Shutter Speed
                    "0e d2" + // Unknown
                    "0f d2" + // Color temp
                    "10 d2" + // CC Filter
                    "11 d2" + // Aspect Ratio
                    "13 d2" + // Focus Found
                    "14 d2" + 
                    "15 d2" + 
                    "17 d2" + 
                    "18 d2" +
                    "1b d2" + 
                    "1c d2" + 
                    "1d d2" + 
                    "1e d2" + 
                    "1f d2" +
                    "21 d2" + 
                    "22 d2" + 
                    "23 d2" +
                    "2a d2" + 
                    "2c d2" + 
                    "31 d2" + 
                    "35 d2" + 
                    "36 d2" + 
                    "3e d2" + 
                    "3f d2" + 
                    "40 d2" +
                    "41 d2" + 
                    "42 d2" + 
                    "43 d2" + 
                    "44 d2" + 
                    "45 d2" + 
                    "46 d2" + 
                    "47 d2" + 
                    "48 d2" +
                    "49 d2" +
                    "4a d2" + 
                    "4c d2" + 
                    "4e d2" +
                    "4f d2" + 
                    "50 d2" + 
                    "51 d2" + 
                    "52 d2" +
                    "53 d2" +
                    "54 d2" + 
                    "55 d2" + 
                    "56 d2" + 
                    "57 d2" + 
                    "58 d2" + 
                    "59 d2" + 
                    "5a d2" +
                    "5b d2" + 
                    "5c d2" +
                    "5d d2" + 
                    "5f d2" + 
                    "60 d2" + 
                    "61 d2" + 
                    "62 d2" + 
                    "63 d2" +
                    "64 d2" +
                    "67 d2" + 
                    "78 d2" + 
                    "16 00 00 00" + 
                    "c1 d2" + 
                    "c2 d2" + 
                    "c3 d2" +
                    "c7 d2" + 
                    "c8 d2" + 
                    "c9 d2" + 
                    "ca d2" + 
                    "cd d2" + 
                    "ce d2" + 
                    "cf d2" + 
                    "d0 d2" +
                    "d1 d2" + 
                    "d2 d2" + 
                    "d5 d2" + 
                    "d6 d2" + 
                    "d7 d2" + 
                    "d8 d2" + 
                    "d9 d2" + 
                    "da d2" +
                    "db d2" + 
                    "dc d2" + 
                    "dd d2";
                let sdioGetExtDeviceInfoPayload = dataFactory.createFromHexString(hexString);

                dataContainer = packet.createDataContainer(request.transactionId, sdioGetExtDeviceInfoPayload);

                for (var i = 0; i < dataContainer.length; i++) {

                    let dataPacket = dataContainer[i];
                //     if (i == 1) {
                //         // TODO(gswirski): this is not needed to establish connection
                //         // but brings Wireshark sessions in-line with what I saw on a9
                //         data = packet.createEventPacket();
                //         eventLoop.scheduleSend(data);
                //     }
                    loop.scheduleSend(dataPacket);
                }

                // TODO(simon): This is not needed to establish connection
                // but brings Wireshark in-line with what gswirski saw on a9
                // var unknownData = dataFactory.create();
                // unknownData.appendWord(0);
                // loop.scheduleSend(packet.createUnknownSonyPacket(4294951427, 0x0000ffff, unknownData));

                loop.scheduleSend(packet.createCmdResponse(responseCodes.ok, request.transactionId));
            break;
            case operationCodes.getDevicePropDesc:
            case operationCodes.sonyGetDevicePropDesc:

                console.log("Received getDevicePropDesc", request, request.argsData.toBigEndianHex());

                var propertyCode = request.argsData.getWord(0);

                data = device.getPropData(propertyCode);

                console.log("Received getDevicePropDesc", propertyCode, data.toHex());

                if (data) {

                    dataContainer = packet.createDataContainer(request.transactionId, data);
                    for (var dataPacket of dataContainer) {
                      loop.scheduleSend(dataPacket);
                    }

                    loop.scheduleSend(packet.createCmdResponse(responseCodes.ok, request.transactionId));

                } else {

                    loop.scheduleSend(packet.createCmdResponse(responseCodes.devicePropNotSupported, request.transactionId));
                }

            break;
            case operationCodes.getAllDevicePropData:

                // TODO(gswirski): this should be relatively easy to break
                // down once we know how to handle single properties
                hexString = "48 00 00 00 00 00 00 00 " + // 72 distinct properties seems too high?

                    device.getAllPropData().toHex() +

                    "2c d2 " + // Unknown
                    "04 00 " + // uint16
                    "01 01 " + // Get and Set
                    "00 00 " + // Factory
                    "06 02 " + // Current
                    "02 " + // Enum
                    "0e 00 " + // 14 available values
                    "01 00 02 00 " +
                    "03 00 01 01 02 01 03 01 04 01 01 02 02 02 03 02 " +
                    "04 02 05 02 06 02 07 02 " +
                    "0e 00 " + // 14 supported values
                    "01 00 02 00 03 00 " +
                    "01 01 02 01 03 01 04 01 01 02 02 02 03 02 04 02 " +
                    "05 02 06 02 07 02 " + 

                    "31 d2 " + // Unknown
                    "02 00 " + // uint8
                    "00 02 " + // Get and set 
                    "00 " + // Factory
                    "01 " + // Current
                    "02 " + // Enum
                    "02 00 " + // 2 values
                    "01 02 " + // 1 and 2
                    "02 00 " + // 2 values
                    "01 02 " + // 1 and 2

                    "35 d2 " + // Unknown
                    "02 00 " + // uint8
                    "01 01 " + // Erm?
                    "00 " + // Factory
                    "00 " + // Current
                    "02 " + // Array
                    "02 00 " + // 2 values
                    "00 01 " + // 0 and 1
                    "02 00 " + 
                    "00 01 " + // 0 and 1

                    "36 d2 " + // Unknown
                    "02 00 " + // uint8
                    "01 01 " + // ???
                    "00 " + // Factory
                    "01 " + // Current
                    "02 " + // Enum
                    "02 00 " + // 2 values
                    "00 01 " + 
                    "02 00 " + 
                    "00 01 " + 

                    "3e d2 " + // Unknown
                    "02 00 " + // uint8 
                    "01 01 " + // ??
                    "00 " +
                    "00 " +
                    "02 " +
                    "00 00 00 00 " +

                    "3f d2 " + // Unknown
                    "02 00 " + // uint8
                    "01 01 " + 
                    "00 " +
                    "00 " +  
                    "02 " +
                    "00 00 " +
                    "00 00 " + 

                    "40 d2 " + // Unknown
                    "02 00 " + // uint8
                    "01 01 " + // Get and set
                    "00 " + // Factory 
                    "0e " + // Current 
                    "02 " + // Array 
                    "13 00 " + // 19 items
                    "01 02 03 " + 
                    "04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12 13 " +
                    "13 00 " + 
                    "01 02 03 04 05 06 07 08 09 0a 0b 0c 0d " +
                    "0e 0f 10 11 12 13 " +

                    "43 d2 " + // Unknown
                    "04 00 " +  // uint16
                    "01 01 " + // GetSet, unknown
                    "00 00 " + // Factory
                    "02 00 " + // Current 
                    "02 " + // Enum
                    "00 00 00 00 " + // No values

                    "44 d2 " + // Unknown
                    "04 00 " + // uint16
                    "01 01 " + // GetSet, unknown
                    "00 00 " + // Factory
                    "02 00 " + // Current
                    "02 " + // Enum
                    "00 00 00 00 " + // No values

                    "45 d2 " + // Unknown
                    "02 00 " + // uint8
                    "01 01 " + // GetSet, unknown
                    "00 " + // Factory
                    "01 " +  // Current
                    "02 " + // Enum
                    "00 00 00 00 " + // No values

                    "46 d2 " + // Unknown
                    "02 00 " + // uint8
                    "01 01 " + // GetSet, unknown
                    "00 " + // Factory
                    "01 " + // Current
                    "02 " + // Enum
                    "00 00 00 00 " + // No values

                    "47 d2 " + // Unknown 
                    "02 00 " + // uint8 
                    "01 01 " + // GetSet, unknown 
                    "00 " + // Factory
                    "00 " + // Current
                    "02 " + // Enum
                    "04 00 " + // 4 available Values
                    "00 01 02 03 " + 
                    "04 00 " + // 4 supported values
                    "00 01 02 03 " +

                    "48 d2 " + // Storage state
                    "02 00 " + // uint8 
                    "01 01 " + // Get, Unknown 
                    "00 " + // Factory
                    "01 " + // Current (0x01 = card inserted, 0x02 = no media)
                    "02 " + // Enum 
                    "00 00 00 00 " + // No values

                    "49 d2 " + // Number of pictures remaining
                    "06 00 " + // uint32
                    "01 01 " + // Get, Unknown
                    "00 00 00 00 " + // Factory
                    "00 00 00 00 " + // Current 
                    "01 " + // Range
                    "00 00 00 00 " + // zero
                    "ff ff ff ff " + // max uint32
                    "01 00 00 00 " + // 1 

                    "4a d2 " + // Remaining capture time
                    "06 00 " + // uint32
                    "01 01 " + // Get, Unknown
                    "00 00 00 00 " + // Factory
                    "00 00 00 00 " + // Current 
                    "01 " + // Range
                    "00 00 00 00 " + // zero
                    "ff ff ff ff " + // max uint32
                    "01 00 00 00 " + // 1 

                    "4c d2 " + // Unknown
                    "02 00 " + // uint8
                    "01 01 " + // Get, Unknown
                    "00 " + // Factory
                    "64 " + // Current 
                    "01 " + // Range
                    "00 " + // 0 
                    "00 " + // 0
                    "01 " + // 1 

                    "4e d2 " + // Unknown
                    "04 00 " + // uint16
                    "01 01 " + // GetSet, Unknown
                    "00 00 " +
                    "01 00 " +
                    "02 " +
                    "00 00 00 00 " +

                    "4f d2 " + // unknown
                    "02 00 " + // uint8
                    "01 01" + // GetSet, Unknown
                    "00" + // Factory
                    "01" + // Current
                    "02" + // Enum
                    "02 00 01 02 02 00 01 02 50 d2 02 00 " +
                    "00 01 00 00 02 00 00 00 00 51 d2 02 00 00 02 00 " +
                    "00 01 00 02 01" + 

                    "52 d2" + // Still Quality 
                    "02 00" +  //uint8 
                    "01 01" + // GetSet, Unknown 
                    "00" + // Factory 
                    "01" + // Current 
                    "02" + // Enum 
                    "03 00 " + // 3 values
                    "01 02 03" + // 01 = Extra Fine, 02 = fine, 03 = standard
                    "03 00" + 
                    "01 02 03" + 

                    "53 d2 02 00 01 01 00 01 " +
                    "02 03 00 01 02 03 03 00 01 02 03 54 d2 08 00 01 " +
                    "02 00 00 00 00 00 00 00 00 f0 00 40 01 00 00 00 " +
                    "00 02 00 00 04 00 ff ff ff ff 00 00 00 00 ff ff " +
                    "ff ff 0a 00 00 00 ff ff ff ff 2f 00 00 00 ff ff " +
                    "ff ff 5e 00 00 00" + 

                    "55 d2" + 
                    "02 00" + 
                    "01 01" + 
                    "00 04" + 
                    "02 05 00" +
                    "05 04 03 02 01" + 
                    "05 00" + 
                    "05 04 03 02 01" + 

                    "56 d2 02 " +
                    "00 00 00 00 04 02 00 00 00 00 57 d2 06 00 00 00 " +
                    "00 00 00 00 00 00 00 00 01 00 00 00 00 ff ff ff " +
                    "ff 01 00 00 00 58 d2 06 00 00 00 00 00 00 00 00 " +
                    "00 00 00 01 00 00 00 00 ff ff ff ff 01 00 00 00 " +
                    "59 d2 02 00 01 02 00 01 02 00 00 00 00 5a d2 02 " +
                    "00 01 01 00 00 02 02 00 00 01 02 00 00 01" + 

                    "5b d2 " + //???
                    "02 00" + // uint8
                    "01 01" + // No get or set
                    "01 01" + // Factory Current
                    "02" + //Enum
                    "02 00" +// 2 values 
                    "00 01" + 
                    "02 00" + 
                    "00 01" + 

                    "5c " +
                    "d2 06 00 01 00 00 00 00 00 e8 03 00 00 01 e8 03 " +
                    "00 00 e8 03 00 00 64 00 00 00" + 

                    "5d d2" + // Digital zoom
                    "06 00" + // uint32
                    "00 00" + // GetSet, Unknown 
                    "00 00 00 00" + // Factory
                    "00 00 00 01 " + // Current
                    "00" + // Unknown

                    "5f d2" + // Something to do with BULB
                    "02 00" + // uint8
                    "01 02" + // No get, set  
                    "00 00" + // Factory Current
                    "02 00 00 00 00" + 

                    "60 d2 " +
                    "02 00 00 00 00 01 02 00 00 00 00" + 

                    "61 d2" + 
                    "06 00" + 
                    "00 00" +
                    "00 00 00 00" + 
                    "15 00 00 00" + 
                    "01" + 
                    "00 00 00 00" + 
                    "ff ff ff ff" +
                    "01 00 00 00" + 

                    "62 d2 02 00 01 01 00 00 02 02 " +
                    "00 01 00 02 00 01 00 63 d2 02 00 01 01 00 00 02 " +
                    "02 00 01 00 02 00 01 00 64 d2 02 00 00 01 00 00 " +
                    "02 00 00 00 00 67 d2 06 00 00 01 00 00 00 00 00 " +
                    "00 00 00 01 00 00 00 00 e0 01 80 02 01 00 00 00 " +
                    "78 d2 ff ff 00 02 00 62 68 00 74 00 74 00 70 00 " +
                    "3a 00 2f 00 2f 00 31 00 39 00 32 00 2e 00 31 00 " +
                    "36 00 38 00 2e 00 31 00 32 00 32 00 2e 00 31 00 " +
                    "3a 00 36 00 30 00 31 00 35 00 32 00 2f 00 6c 00 " +
                    "69 00 76 00 65 00 76 00 69 00 65 00 77 00 73 00 " +
                    "74 00 72 00 65 00 61 00 6d 00 3f 00 25 00 32 00 " +
                    "31 00 31 00 32 00 33 00 34 00 25 00 32 00 31 00 " +
                    "25 00 32 00 61 00 25 00 33 00 61 00 25 00 32 00 " +
                    "61 00 25 00 33 00 61 00 69 00 6d 00 61 00 67 00 " +
                    "65 00 25 00 32 00 66 00 6a 00 70 00 65 00 67 00 " +
                    "25 00 33 00 61 00 25 00 32 00 61 00 25 00 32 00 " +
                    "31 00 25 00 32 00 31 00 25 00 32 00 31 00 25 00 " +
                    "32 00 31 00 25 00 32 00 31 00 00 00 00";

                let allDevicePropDataPayload = dataFactory.createFromHexString(hexString)
                console.log("Received Get_All_Device_Prop_Data request", request);

                dataContainer = packet.createDataContainer(request.transactionId, allDevicePropDataPayload);
                for (var data of dataContainer) {
                  loop.scheduleSend(data);
                }

                loop.scheduleSend(packet.createCmdResponse(responseCodes.ok, request.transactionId));
            break;
            case operationCodes.unknownHandshakeRequest:
                hexString = "81 00 00 00 00";
                let unknownHandshakePayload = dataFactory.createFromHexString(hexString)

                console.log("Received 0x920D request", request);

                dataContainer = packet.createDataContainer(request.transactionId, unknownHandshakePayload);
                for (var data of dataContainer) {
                  loop.scheduleSend(data);
                }

                loop.scheduleSend(packet.createCmdResponse(responseCodes.ok, request.transactionId));
            break;
            case operationCodes.setControlDeviceA:
                console.log("Received setControlDeviceA", request);

                var propertyCode = request.argsData.getWord(0);

                startDataPacketCallbacks[request.transactionId] = function (content) {
                    // do nothing
                };
                dataPacketCallbacks[request.transactionId] = function (content) {

                    let prop = device.getProp(propertyCode);

                    if (prop) {

                        let value;
                        let paramData;
                        switch (prop.dataType) {
                            case devicePropTypes.int8:
                            case devicePropTypes.uint8:
                                value = content.payloadData.getByte(0);
                                paramData = content.payloadData.slice(0, 1);
                            break;
                            case devicePropTypes.int16:
                            case devicePropTypes.uint16:
                                value = content.payloadData.getWord(0);
                                paramData = content.payloadData.slice(0, 2);
                            break;
                            case devicePropTypes.uint32:
                                value = content.payloadData.getDword(0);
                                paramData = content.payloadData.slice(0, 4);
                            default:
                            break;
                        }

                        console.log("setting", prop.dataType, content.payloadData.toHex());
                        console.log("setting", content.payloadData.toHex(), value, paramData.toHex(), paramData.toBigEndianHex());
                        device.setPropValue(propertyCode, value);
                    }
                };

                endDataPacketCallbacks[request.transactionId] = function (content) {
                    eventLoop.scheduleSend(packet.createEventPacket(content.transactionId));
                };

                loop.scheduleSend(packet.createCmdResponse(responseCodes.ok, request.transactionId));
            break;
            case operationCodes.setControlDeviceB:

                console.log("Received setControlDeviceB", request, request.argsData.toHex());

                var propertyCode = request.argsData.getWord(0);

                switch (propertyCode) {
                    case deviceProps.halfPressShutter:
                    setTimeout(function () {
                        device.setPropValue(deviceProps.FocusFound, 2);
                        eventLoop.scheduleSend(packet.createEventPacket(request.transactionId, eventLoop.eventCodes.sonyPropertyChanged, [deviceProps.FocusFound]))
                    }, 400);
                    break;
                    case deviceProps.captureImage:
                    setTimeout(function () {
                        device.setPropValue(deviceProps.ObjectInMemory, 129);
                        eventLoop.scheduleSend(packet.createEventPacket(request.transactionId, eventLoop.eventCodes.sonyPropertyChanged, [deviceProps.ObjectInMemory]))
                        eventLoop.scheduleSend(packet.createEventPacket(request.transactionId, eventLoop.eventCodes.sonyObjectAdded, [0xffffc001]))
                    }, 1200);
                    default:
                    break;
                }

                startDataPacketCallbacks[request.transactionId] = function (content) {
                    // do nothing
                };
                dataPacketCallbacks[request.transactionId] = function (content) {

                    let prop = device.getProp(propertyCode);

                    if (prop) {

                        let value;
                        let paramData;
                        switch (prop.dataType) {
                            case devicePropTypes.int8:
                            case devicePropTypes.uint8:
                                value = content.payloadData.getByte(0);
                                paramData = content.payloadData.slice(0, 1);
                            break;
                            case devicePropTypes.int16:
                            case devicePropTypes.uint16:
                                value = content.payloadData.getWord(0);
                                paramData = content.payloadData.slice(0, 2);
                            break;
                            case devicePropTypes.uint32:
                                value = content.payloadData.getDword(0);
                                paramData = content.payloadData.slice(0, 4);
                            default:
                            break;
                        }

                        console.log("setting", content.payloadData.toHex(), value, paramData.toHex(), paramData.toBigEndianHex());
                        device.setPropValue(propertyCode, value);
                    }
                };

                endDataPacketCallbacks[request.transactionId] = function (content) {
                    eventLoop.scheduleSend(packet.createEventPacket(content.transactionId));
                };

                loop.scheduleSend(packet.createCmdResponse(responseCodes.ok, request.transactionId));
            break;
            default:
                console.log("Got unknown opcode request", request.opCode);
                loop.scheduleSend(packet.createCmdResponse(responseCodes.ok, request.transactionId));

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
