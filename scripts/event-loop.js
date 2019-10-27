/*jslint browser: true, maxerr: 50, maxlen: 80 */

/*global define, Uint8Array */

define([
    './packet', './loop-factory', './util'
], function (packet, loopFactory, util) {
    'use strict';

    var onInitialized = util.nop, sessionId, eventCodes,
        loop = loopFactory.create('event'),
        captureCompleteCallbacks = {}, // by transaction ID
        objectAddedCallbacks = [],
        eventHandlers = {}, // by event code
        allowedEventProperties;

    eventCodes = {
        objectAdded: 0x4002,
        captureComplete: 0x400D,

        // Sony specific events
        sonyObjectAdded: 0xC201,
        sonyObjectRemoved: 0xC202,
        sonyPropertyChanged: 0xC203,
    };

    allowedEventProperties = {
        DPCCompensation: 0xD200,
        DRangeOptimize: 0xD201,
        ImageSize: 0xD203,
        ShutterSpeed: 0xD20D,
        ColorTemp: 0xD20F,
        CCFilter: 0xD210,
        AspectRatio: 0xD211,
        FocusFound: 0xD213,
        ObjectInMemory: 0xD215,
        ExposeIndex: 0xD216,
        BatteryLevel: 0xD218,
        PictureEffect: 0xD21B,
        ABFilter: 0xD21C,
        ISO: 0xD21E,
        Movie: 0xD2C8,
        StillImage: 0xD2C7,
        WhiteBalance: 0x5005,
    };

    eventHandlers[eventCodes.captureComplete] = function (content) {
        var transactionId = content.parameters[0],
            callback = captureCompleteCallbacks[transactionId];

        if (callback !== undefined) {
            callback();
            delete captureCompleteCallbacks[transactionId];
        }
    };

    eventHandlers[eventCodes.objectAdded] = function (content) {
        var i, callback;

        for (i = 0; i < objectAddedCallbacks.length; i += 1) {
            callback = objectAddedCallbacks[i];
            if (typeof callback === 'function') {
                callback(content);
            }
        }
    };

    Object.freeze(eventCodes);

    loop.onDataCallbacks[packet.types.initEventAck] = function () {
        onInitialized();
    };

    loop.onDataCallbacks[packet.types.event] = function (content) {
        var handler = eventHandlers[content.eventCode];

        if (handler !== undefined) {
            handler(content);
        }
    };

    loop.onSocketOpened = function () {
        if (sessionId !== undefined) {
            loop.scheduleSend(packet.createInitEventRequest(sessionId));
        }
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
        sessionId: {set: function (x) {
            sessionId = x;
        }},
        eventCodes: {get: function () {
            return eventCodes;
        }},
        captureCompleteCallbacks: {get: function () {
            return captureCompleteCallbacks;
        }},
        objectAddedCallbacks: {get: function () {
            return objectAddedCallbacks;
        }},
        stop: {value: loop.stop}
    });
});
