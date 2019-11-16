/*jslint browser: true, maxerr: 50, maxlen: 80 */

/*global define */

define(function () {
    'use strict';

    // (Smart/Multi = 0x8001, Center Weighted = 0x8002, Whole Screen AVG = 0x8003
                    //  , Spot (Standard) = 0x8004, Spot (Large) = 0x8005, Highlight = 0x8006)

    return Object.freeze({
        multi: 0x8001,
        center_weighted: 0x8002,
        whole_screen_average: 0x8003,
        spot: 0x8004,
        spot_large: 0x8005,
        highlight: 0x8006
    });
});
