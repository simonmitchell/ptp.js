define(['./device-prop-codes', './device-prop-types', './device-prop', 'props/white-balance', 
        'props/focus-mode', 'props/metering-mode', 'props/flash-mode', 'props/exposure-programme-mode',
        'props/still-capture-mode'], 
        function (devicePropTypes, devicePropDataTypes, deviceProp, whiteBalance, focusMode, 
                    meteringMode, flashMode, exposureProgramMode, stillCaptureMode) {

    var propTypes;

    props = {
        [devicePropTypes.whiteBalance]: deviceProp.create(
            devicePropTypes.whiteBalance,
            devicePropDataTypes.uint16,
            true, true, 
            whiteBalance.auto, whiteBalance.auto,
            true,
            Object.values(whiteBalance), Object.values(whiteBalance)
        ),
        [devicePropTypes.fNumber]: deviceProp.create(
            devicePropTypes.fNumber,
            devicePropDataTypes.uint16,
            true, true,
            0xffff, 0x0118,
            true,
            [0x0118, 0x0140, 0x015e, 0x0190, 0x01c2, 0x01f4, 0x0230, 0x0276,
             0x02c6, 0x0320, 0x0384, 0x03e8, 0x044c, 0x0514, 0x0578, 0x0640,
             0x0708, 0x07d0, 0x0898],
            [0x0118, 0x0140, 0x015e, 0x0190, 0x01c2, 0x01f4, 0x0230, 0x0276,
             0x02c6, 0x0320, 0x0384, 0x03e8, 0x044c, 0x0514, 0x0578, 0x0640,
             0x0708, 0x07d0, 0x0898]
        ),
        [devicePropTypes.focusMode]: deviceProp.create(
            devicePropTypes.focusMode,
            devicePropDataTypes.uint16,
            true, true,
            focusMode.manual, focusMode.manual,
            true,
            Object.values(focusMode), Object.values(focusMode)
        ),
        [devicePropTypes.exposureMeteringMode]: deviceProp.create(
            devicePropTypes.exposureMeteringMode,
            devicePropDataTypes.uint16,
            true, true,
            meteringMode.multi, meteringMode.multi,
            true,
            Object.values(meteringMode), Object.values(meteringMode)
        ),
        [devicePropTypes.flashMode]: deviceProp.create(
            devicePropTypes.flashMode,
            devicePropDataTypes.uint16,
            true, true,
            flashMode.auto, flashMode.auto,
            true,
            Object.values(flashMode), Object.values(flashMode)
        ),
        [devicePropTypes.exposureProgramMode]: deviceProp.create(
            devicePropTypes.exposureProgramMode,
            devicePropDataTypes.uint32,
            true, true,
            exposureProgramMode.manual, exposureProgramMode.manual,
            true,
            Object.values(exposureProgramMode), Object.values(exposureProgramMode)
        ),
        [devicePropTypes.exposureBiasCompensation]: deviceProp.create(
            devicePropTypes.exposureBiasCompensation,
            devicePropDataTypes.int16,
            true, true,
            0x0000, 0x0000,
            true,
            [5000, 4700, 4300, 4000, 3700, 3300, 3000, 2700, 2300, 2000, 1700, 1300, 1000, 700, 300, 0, 
            -300, -700, -1000, -1300, -1700, -2000, -2300, -2700, -3000, -3300, -3700, -4000, -4300, -4700, -5000],
            [5000, 4700, 4300, 4000, 3700, 3300, 3000, 2700, 2300, 2000, 1700, 1300, 1000, 700, 300, 0, 
            -300, -700, -1000, -1300, -1700, -2000, -2300, -2700, -3000, -3300, -3700, -4000, -4300, -4700, -5000]
        ),
        [devicePropTypes.stillCaptureMode]: deviceProp.create(
            devicePropTypes.stillCaptureMode,
            devicePropDataTypes.uint32,
            true, true,
            stillCaptureMode.single, stillCaptureMode.single,
            true,
            Object.values(stillCaptureMode), Object.values(stillCaptureMode)
        )
    };
    
    return Object.create(null, {
        getProp: {value: function (propType) {
            return props[propType];
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
