/*jslint browser: true, maxerr: 50, maxlen: 80 */

/*global define */

define(function () {
    'use strict';

    // (AWB = 0x0002, Daylight = 0x0004, Shade = 0x0811, Cloudy = 0x0810, Incandescent = 0x0006,
                    //  Fluor (Warm White) = 0x8001, Fluor (Cool White) = 0x8002, Fluor (Day White) = 0x8003,
                    //  Fluor (Daylight) = 0x8004, Flash = 0x0007, Underwater Auto = 0x8030, Color Temp = 0x8012,
                    //  Custom 1 = 0x8020, Custom 2 = 0x8021, Custom 3 = 0x8022)

    return Object.freeze({
        auto: 0x0002,
        daylight: 0x0004,
        shade: 0x8011,
        cloudy: 0x8010,
        incandescent: 0x0006,
        fluorescent_warm_white: 0x8001,
        fluorescent_cool_white: 0x8002,
        fluorescent_day_white: 0x8003,
        fluorescent_daylight: 0x8004,
        flash: 0x0007,
        underwater_auto: 0x8030,
        colortemp: 0x8012,
        c1: 0x8020,
        c2: 0x8021,
        c3: 0x8022
    });
});
