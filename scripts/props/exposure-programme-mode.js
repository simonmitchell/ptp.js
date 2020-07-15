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
        highFrameRateProgrammedAuto: 0x00088080,
        panorama: 0x00068041,
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
        intelligent_auto: 0x00048000,
        superior_auto: 0x00048001,
        highframerate_aperture_priority: 0x00088081,
        highframerate_shutter_priority: 0x00088082,
        highframerate_manual: 0x00088083,
        scene_portrait: 0x00000007,
        scene_sport: 0x00058011,
        scene_sunset: 0x00058012,
        scene_night: 0x00058013,
        scene_landscape: 0x00058014,
        scene_macro: 0x00058015,
        scene_handheldTwilight: 0x00058016,
        scene_nightPortrait: 0x00058017, // Night portrait
        scene_antiMotionBlur: 0x00058018, // Anti motion-blur
        scene_pet: 0x00058019, // Pet
        scene_food: 0x0005801a, // Gourment
        scene_fireworks: 0x0005801b, // Fireworks
        scene_high_sensitivity: 0x0005801c // High Sensitivity
    });
});