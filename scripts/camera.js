define(['./data-factory', './device-prop-codes', './device-prop-types', './device-prop', 'props/white-balance', 
        'props/focus-mode', 'props/metering-mode', 'props/flash-mode', 'props/exposure-programme-mode',
        'props/still-capture-mode', 'props/shutter-speed', 'props/d-range-optimise', 'props/aspect-ratio',
        'props/picture-effect', 'props/iso', 'props/movie-format', 'props/movie-quality'], 
        function (dataFactory, devicePropTypes, devicePropDataTypes, deviceProp, whiteBalance, focusMode, 
                    meteringMode, flashMode, exposureProgramMode, stillCaptureMode, shutterSpeed, dro, aspectRatio,
                    pictureEffect, iso, movieFormat, movieQuality) {

    var propTypes;

    props = {
        [devicePropTypes.whiteBalance]: deviceProp.createWithValues(
            devicePropTypes.whiteBalance,
            devicePropDataTypes.uint16,
            0x01, 0x01, 
            0x0000, whiteBalance.auto,
            Object.values(whiteBalance), Object.values(whiteBalance)
        ),
        [devicePropTypes.fNumber]: deviceProp.createWithValues(
            devicePropTypes.fNumber,
            devicePropDataTypes.uint16,
            0x01, 0x01,
            0xffff, 0x0118,
            [0x0118, 0x0140, 0x015e, 0x0190, 0x01c2, 0x01f4, 0x0230, 0x0276,
             0x02c6, 0x0320, 0x0384, 0x03e8, 0x044c, 0x0514, 0x0578, 0x0640,
             0x0708, 0x07d0, 0x0898],
            [0x0118, 0x0140, 0x015e, 0x0190, 0x01c2, 0x01f4, 0x0230, 0x0276,
             0x02c6, 0x0320, 0x0384, 0x03e8, 0x044c, 0x0514, 0x0578, 0x0640,
             0x0708, 0x07d0, 0x0898]
        ),
        [devicePropTypes.focusMode]: deviceProp.createWithValues(
            devicePropTypes.focusMode,
            devicePropDataTypes.uint16,
            0x01, 0x01,
            focusMode.manual, focusMode.manual,
            Object.values(focusMode), Object.values(focusMode)
        ),
        [devicePropTypes.exposureMeteringMode]: deviceProp.createWithValues(
            devicePropTypes.exposureMeteringMode,
            devicePropDataTypes.uint16,
            0x01, 0x01,
            meteringMode.multi, meteringMode.multi,
            Object.values(meteringMode), Object.values(meteringMode)
        ),
        [devicePropTypes.flashMode]: deviceProp.createWithValues(
            devicePropTypes.flashMode,
            devicePropDataTypes.uint16,
            0x01, 0x01,
            flashMode.auto, flashMode.auto,
            Object.values(flashMode), Object.values(flashMode)
        ),
        [devicePropTypes.exposureProgramMode]: deviceProp.createWithValues(
            devicePropTypes.exposureProgramMode,
            devicePropDataTypes.uint32,
            0x01, 0x01,
            exposureProgramMode.manual, exposureProgramMode.manual,
            Object.values(exposureProgramMode), Object.values(exposureProgramMode)
        ),
        [devicePropTypes.exposureBiasCompensation]: deviceProp.createWithValues(
            devicePropTypes.exposureBiasCompensation,
            devicePropDataTypes.int16,
            0x01, 0x01,
            0x0000, 0x0000,
            [5000, 4700, 4300, 4000, 3700, 3300, 3000, 2700, 2300, 2000, 1700, 1300, 1000, 700, 300, 0, 
            -300, -700, -1000, -1300, -1700, -2000, -2300, -2700, -3000, -3300, -3700, -4000, -4300, -4700, -5000],
            [5000, 4700, 4300, 4000, 3700, 3300, 3000, 2700, 2300, 2000, 1700, 1300, 1000, 700, 300, 0, 
            -300, -700, -1000, -1300, -1700, -2000, -2300, -2700, -3000, -3300, -3700, -4000, -4300, -4700, -5000]
        ),
        [devicePropTypes.stillCaptureMode]: deviceProp.createWithValues(
            devicePropTypes.stillCaptureMode,
            devicePropDataTypes.uint32,
            0x01, 0x01,
            stillCaptureMode.single, stillCaptureMode.single,
            Object.values(stillCaptureMode), Object.values(stillCaptureMode)
        ),
        [devicePropTypes.DPCCompensation]: deviceProp.createWithValues(
            devicePropTypes.DPCCompensation,
            devicePropDataTypes.int16,
            0x01, 0x01,
            0x0000, 0x0000,
            [0x0bb8, 0x0a8c, 0x08fc, 0x07d0, 0x06a4, 0x0514, 0x03e8, 0x02bc, 0x012c, 0x0000, 0xfed4, 0xfd44, 0xfc18, 0xfaec,
            0xf95c, 0xf830, 0xf704, 0xf574, 0xf448],
            [0x0bb8, 0x0a8c, 0x08fc, 0x07d0, 0x06a4, 0x0514, 0x03e8, 0x02bc, 0x012c, 0x0000, 0xfed4, 0xfd44, 0xfc18, 0xfaec,
            0xf95c, 0xf830, 0xf704, 0xf574, 0xf448]
        ),
        [devicePropTypes.DRangeOptimize]: deviceProp.createWithValues(
            devicePropTypes.DRangeOptimize,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            dro.off, dro.off,
            [dro.off,
            dro.dro_auto,
            dro.dro_lv1,
            dro.dro_lv2,
            dro.dro_lv3,
            dro.dro_lv4,
            dro.dro_lv5], Object.values(dro)
        ),
        [devicePropTypes.ImageSize]: deviceProp.createWithValues(
            devicePropTypes.ImageSize,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            0x00, 0x01,
            // 0x01 = L, 0x02 = M, 0x03 = S
            [0x01, 0x02, 0x03], [0x01, 0x02, 0x03]
        ),
        [devicePropTypes.ShutterSpeed]: deviceProp.createWithValues(
            devicePropTypes.ShutterSpeed,
            devicePropDataTypes.uint32,
            0x01, 0x01,
            0x00000000, 0x00000000,
            shutterSpeed, shutterSpeed
        ),
        0xd20e: deviceProp.createWithValues(
            0xd20e,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            0x00, 0x06,
            [], []
        ),
        [devicePropTypes.ColorTemp]: deviceProp.createWithRange(
            devicePropTypes.ColorTemp,
            devicePropDataTypes.uint16,
            0x01, 0x01,
            0x0000, 0x09c4,
            0x09c4, 0x26ac, 0x0064
        ),
        [devicePropTypes.CCFilter]: deviceProp.createWithRange(
            devicePropTypes.CCFilter,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            0x00, 0xc0,
            0xa4, 0xdc, 0x01
        ),
        [devicePropTypes.AspectRatio]: deviceProp.createWithValues(
            devicePropTypes.AspectRatio,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            0x00, 0x01,
            Object.values(aspectRatio), Object.values(aspectRatio)
        ),
        [devicePropTypes.FocusFound]: deviceProp.createWithValues(
            devicePropTypes.FocusFound,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            0x00, 0x01,
        ),
        0xd214: deviceProp.createWithRange(
            0xd214,
            devicePropDataTypes.uint32,
            0x01, 0x01,
            0xffffffff, 0xffffffff,
            0x00000000, 0xffffffff, 0x01000000
        ),
        [devicePropTypes.ObjectInMemory]: deviceProp.createWithRange(
            devicePropTypes.ObjectInMemory,
            devicePropDataTypes.uint16,
            0x01, 0x01,
            0x0000, 0x0000,
            0x0000, 0xffff, 0x0001 
        ),
        0xd217: deviceProp.createWithValues(
            0xd217,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            0x00, 0x01
        ),
        [devicePropTypes.BatteryLevel]: deviceProp.createWithRange(
            devicePropTypes.BatteryLevel,
            devicePropDataTypes.int8,
            0x01, 0x01,
            0x00, 0x35,
            0xff, 0x64, 0x01
        ),
        [devicePropTypes.PictureEffect]: deviceProp.createWithValues(
            devicePropTypes.PictureEffect,
            devicePropDataTypes.uint16,
            0x01, 0x01,
            0x0000, 0x8000,
            [pictureEffect.unknown_0], Object.values(pictureEffect)
        ),
        [devicePropTypes.ABFilter]: deviceProp.createWithRange(
            devicePropTypes.ABFilter,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            0x00, 0xc0,
            0xa4, 0xdc, 0x02
        ),
        0xd21d: deviceProp.createWithRange(
            0xd21d,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            0x00, 0x00,
            0x00, 0x02, 0x01
        ),
        [devicePropTypes.ISO]: deviceProp.createWithValues(
            devicePropTypes.ISO,
            devicePropDataTypes.uint32,
            0x01, 0x01,
            iso.auto, iso.auto,
            Object.values(iso), Object.values(iso)
        ),
        0xd21f: deviceProp.createWithValues(
            0xd21f,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            0x00, 0x01
        ),
        0xd221: deviceProp.createWithValues(
            0xd221,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            0x00, 0x01
        ),
        0xd222: deviceProp.createWithValues(
            0xd221,
            devicePropDataTypes.uint16,
            0x01, 0x01,
            0x0000, 0x0001,
            [0x0001, 0x0011, 0x0010], [0x0001, 0x0011, 0x0010]
        ),
        0xd223: deviceProp.createWithString(
            0xd223,
            0x01, 0x01,
            "",
            "",
            0x00
        ),
        0xd22a: deviceProp.createWithValues( // 0x01 is lock-unavailable, 0x02 is unlocked (Able to change exposure settings), 0x03 is locked (unable to change)
            0xd22a,
            devicePropDataTypes.uint8,
            0x01, 0x01, // Get Set
            0x01, 0x01 // Factory... Current
        ),
        [devicePropTypes.MovieFormat]: deviceProp.createWithValues(
            devicePropTypes.MovieFormat,
            devicePropDataTypes.uint8,
            0x01, 0x01,
            movieFormat.xavc_s_4k, movieFormat.xavc_s_4k,
            Object.values(movieFormat), Object.values(movieFormat)
            // Array.from({ length: 255 }, (v, i) => i), Array.from({ length: 255 }, (v, i) => i)
        ),
        [devicePropTypes.MovieQuality]: deviceProp.createWithValues(
            devicePropTypes.MovieQuality,
            devicePropDataTypes.uint16,
            0x01, 0x01,
            movieQuality._25p_16m, movieQuality._25p_16m,
            Array.from({ length: 255 }, (v, i) => i), Array.from({ length: 255 }, (v, i) => i)
        )
    };
    
    return Object.create(null, {
        getProp: {value: function (propType) {
            return props[propType];
        }},
        getAllPropData: {value: function() {
            let data = dataFactory.create();
            Object.values(props).forEach(prop => {
                let propData = prop.getData();
                data.appendData(propData);
            });
            return data;
        }},
        getPropData: {value:  function (propType) {
            let prop = props[propType];
            if (prop) {
                return prop.getData(); 
            } else {
                return null;
            }
        }},
        getPropValue: {value: function (propType) {
            let prop = props[propType];
            if (prop) {
                return prop.currentValue; 
            } else {
                return null;
            }
        }},
        setPropValue: {value: function (propType, value) {
            let prop = props[propType];
            if (prop) {
                prop.currentValue = value;
                return true;
            } else {
                return false;
            }
        }}
    });
});
