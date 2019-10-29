/*jslint browser: true, maxerr: 50, maxlen: 80 */

/*global define */

define(function () {
    'use strict';

    // (Single Shot = 0x00000001, Continous (Hi+ Speed) = 0x00018010, 
    // Continuous (Low speed) = 0x00018012, Continuous = 0x00018013, 
    // Continuous (S?) = 0x00018014, Continuous (Hi speed) = 0x00018015),
    // 10 second timer = 0x00010002, 10 second timer = 0x00038004 <--- Interesting, seems to be two of these
    // 5 second timer = 0x00038003, 2 second timer = 0x00038005, 
    // 10 second 3x = 0x00088008, 10 second 5x = 0x00088009, 5 second 3x = 0x0008800c,
    // 5 second 5x = 0x0008800d, 2 second 3x = 0x0008800e, 2 second 5x = 0x0008800f,
    // BRK C 0.3ev3 = 0x00048337, BRK C 0.3ev5 = 0x00048537, BRK C 0.3ev9 = 0x00048937,
    // BRK C 0.5ev3 = 0x00048357, BRK C 0.5ev5 = 0x00048557, BRK C 0.5ev9 = 0x00048957,
    // BRK C 0.7ev3 = 0x00048377, BRK C 0.7ev5 = 0x00048577, BRK C 0.7ev9 = 0x00048977,
    // BRK C 1.0ev3 = 0x00048311, BRK C 1.0ev5 = 0x00048511, BRK C 1.0ev9 = 0x00048911,
    // BRK C 2.0ev3 = 0x00048321, BRK C 2.0ev5 = 0x00048521, BRK C 3.0ev3 = 0x00048331,
    // BRK C 3.0ev5 = 0x00048531, BRK S 0.3ev3 = 0x00058336, BRK S 0.3ev5 = 0x00058536,
    // BRK S 0.3ev9 = 0x00058936, BRK S 0.5ev3 = 0x00058356, BRK S 0.5ev5 = 0x00058556,
    // BRK S 0.5ev9 = 0x00058956, BRK S 0.7ev3 = 0x00058376, BRK S 0.7ev5 = 0x00058576,
    // BRK S 0.7ev9 = 0x00058976, BRK S 1.0ev3 = 0x00058310, BRK S 1.0ev5 = 0x00058510,
    // BRK S 1.0ev9 = 0x00058910, BRK S 2.0ev3 = 0x00058320, BRK S 2.0ev5 = 0x00058520,
    // BRK S 3.0ev3 = 0x00058330, BRK S 3.0ev5 = 0x00058530, BRK WB Hi = 0x00068028,
    // BRK WB LO = 0x00068018, BRK DRO HI = 0x00078029, BRK DRO LO = 0x00078019

    return Object.freeze({
        single: 0x00000001,
        continuous_hi_plus: 0x00018012,
        continuous_lo: 0x00018013,
        continuous: 0x000000001,
        continuous_s: 0x00018014,
        continuous_hi: 0x00018015,
        timer_10_a: 0x00010002,
        timer_10_b: 0x00038004,
        timer_5: 0x00038003,
        timer_2: 0x00038005,
        timer_10_3: 0x00088008,
        timer_10_5: 0x00088009,
        timer_5_3: 0x0008800c,
        timer_5_5: 0x0008800d,
        timer_2_3: 0x0008800e,
        timer_2_5: 0x0008800f
    });
});
