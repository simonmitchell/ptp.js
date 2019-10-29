define(['./data-factory', './device-prop-types'], function (dataFactory, propTypes) {
    'use strict';

    var create, internalProto = {};

    internalProto.setCurrentValue = function (val) {
        this.currentValue.current = val;
    }

    internalProto.getPropData = function () {
        let data = dataFactory.create();
        data.appendWord(this.type);
        data.appendWord(this.dataType);
        data.appendByte(this.getable ? 0x01 : 0x02);
        data.appendByte(this.setable ? 0x01 : 0x02);
        switch (this.dataType) {
            case propTypes.int8:
                data.appendByte(this.factoryValue);
                data.appendByte(this.currentValue.current);
            break;
            case propTypes.uint8:
                data.appendByte(this.factoryValue);
                data.appendByte(this.currentValue.current);
            break;
            case propTypes.int16:
            case propTypes.uint16:
                data.appendWord(this.factoryValue);
                data.appendWord(this.currentValue.current);
            break;
            case propTypes.uint32:
                data.appendDword(this.factoryValue);
                data.appendDword(this.currentValue.current);
            default:
            break;
        }
        data.appendByte(this.isEnum ? 0x02 : 0x01);

        if (this.availableValues && this.availableValues.length > 0) {
            data.appendWord(this.availableValues.length);
            let availableValue, i;
            for (i = 0; i < this.availableValues.length; i += 1) {
                availableValue = this.availableValues[i];
                switch (this.dataType) {
                    case propTypes.int8:
                        data.appendByte(availableValue);
                    break;
                    case propTypes.uint8:
                        data.appendByte(availableValue);
                    break;
                    case propTypes.int16:
                    case propTypes.uint16:
                        data.appendWord(availableValue);
                    break;
                    case propTypes.uint32:
                        data.appendDword(availableValue);
                    default:
                    break;
                }
            }
        }

        if (this.supportedValues && this.supportedValues.length > 0) {
            data.appendWord(this.supportedValues.length);
            let supportedValue, i;
            for (i = 0; i < this.supportedValues.length; i += 1) {
                supportedValue = this.supportedValues[i];
                switch (this.dataType) {
                    case propTypes.int8:
                        data.appendByte(supportedValue);
                    break;
                    case propTypes.uint8:
                        data.appendByte(supportedValue);
                    break;
                    case propTypes.int16:
                    case propTypes.uint16:
                        data.appendWord(supportedValue);
                    break;
                    case propTypes.uint32:
                        data.appendDword(supportedValue);
                    default:
                    break;
                }
            }
        }

        return data;
    }

    create = function (type, dataType, getable, setable, factoryValue, currentValue, isEnum, availableValues, supportedValues) {

        var internal = Object.create(internalProto, {
            type: {value: type},
            dataType: {value: dataType},
            getable: {value: getable},
            setable: {value: setable},
            factoryValue: {value: factoryValue},
            currentValue: {value: {
                current: currentValue
            }},
            isEnum: {value: isEnum},
            availableValues: {value: availableValues},
            supportedValues: {value: supportedValues}
        });

        return Object.create(null, {
            dataType: {
                get: function () {
                    return internal.dataType;
                }
            },
            currentValue: {
                set: function (val) {
                    internal.setCurrentValue(val);
                },
                get: function () {
                    return internal.currentValue.current;
                }
            },
            getData: {value: function () {
                return internal.getPropData();
            }}
        });
    };

    return Object.create(null, {
        create: {value: create}
    });
});
