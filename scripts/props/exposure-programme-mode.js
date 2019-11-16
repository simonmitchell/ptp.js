/*jslint browser: true, maxerr: 50, maxlen: 80 */

/*global define */

define(function () {
    'use strict';

    // (Programmed Auto = 0x00010002, Aperture Prio. = 0x00020003, Shutter Prio. = 0x00030004,
    //  Manual = 0x00000001, Video Programmed Auto = 0x00078050, Video Aperture Prio. = 0x00078051,
    //  Video Shutter Prio. = 0x00078052, Video Manual. 0x00078053, Slow and Quick Programme Auto = 0x00098059,
    //  Slow and Quick Aperture Prio. = 0x0009805a, Slow and Quick Shuter Prio. = 0x0009805b,
    //  Slow and Quick Manual = 0x0009805c, Intelligent Auto = 0x00048000)

    return Object.freeze({
        programmed_auto: 0x00010002,
        aperture_priority: 0x00020003,
        shutter_priority: 0x00030004,
        manual: 0x000000001,
        video_programmed_auto: 0x00078050,
        video_aperture_priority: 0x00078051,
        video_shutter_priority: 0x00078052,
        video_manual: 0x00078053,
        sq_programmed_auto: 0x00098059,
        sq_aperture_priority: 0x0009805a,
        sq_shutter_priority: 0x0009805b,
        sq_manual: 0x0009805c,
        intelligent_auto: 0x00048000
    });
});