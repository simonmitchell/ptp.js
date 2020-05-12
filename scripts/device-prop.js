define(['./data-factory', './device-prop-types'], function (dataFactory, propTypes) {
    'use strict';

    var createWithRange, createWithValues, createWithString, create, internalProto = {};

    internalProto.setCurrentValue = function (val) {
        this.currentValue.current = val;
    }

    internalProto.getPropData = function () {
        let data = dataFactory.create();
        data.appendWord(this.type);
        data.appendWord(this.dataType);
        data.appendByte(this.getable);
        data.appendByte(this.setable);
        switch (this.dataType) {
            case propTypes.int8:
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
            break;
            case propTypes.string:
                data.appendWstring(this.factoryValue);
                data.appendWstring(this.currentValue.current);
            break;
            default:
            break;
        }

        if (this.isBrokenType) {
            data.appendByte(0x00);
            return data;
        }

        data.appendByte(this.isEnum ? 0x02 : 0x01);

        if (this.isEnum) {
            if (this.availableValues && this.availableValues.length > 0) {
                data.appendWord(this.availableValues.length);
                let availableValue, i;
                for (i = 0; i < this.availableValues.length; i += 1) {
                    availableValue = this.availableValues[i];
                    switch (this.dataType) {
                        case propTypes.int8:
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
            } else {
                data.appendWord(0);
            }

            if (this.supportedValues && this.supportedValues.length > 0) {
                data.appendWord(this.supportedValues.length);
                let supportedValue, i;
                for (i = 0; i < this.supportedValues.length; i += 1) {
                    supportedValue = this.supportedValues[i];
                    switch (this.dataType) {
                        case propTypes.int8:
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
            } else {
                data.appendWord(0);
            }

        } else {

            switch (this.dataType) {
                case propTypes.int8:
                case propTypes.uint8:
                    data.appendByte(this.min);
                    data.appendByte(this.max);
                    data.appendByte(this.step);
                break;
                case propTypes.int16:
                case propTypes.uint16:
                    data.appendWord(this.min);
                    data.appendWord(this.max);
                    data.appendWord(this.step);
                break;
                case propTypes.uint32:
                    data.appendDword(this.min);
                    data.appendDword(this.max);
                    data.appendDword(this.step);
                default:
                break;
            }
        }

        return data;
    }

    createWithString = function (type, getable, setable, factoryValue, currentValue) {

        var internal = Object.create(internalProto, {
            type: {value: type},
            dataType: {value: 0xffff},
            getable: {value: getable},
            setable: {value: setable},
            factoryValue: {value: factoryValue},
            currentValue: {value: {
                current: currentValue
            }},
            isBrokenType: {value: true}
        });

        return create(internal);
    };

    createWithRange = function (type, dataType, getable, setable, factoryValue, currentValue, min, max, step) {

        var internal = Object.create(internalProto, {
            type: {value: type},
            dataType: {value: dataType},
            getable: {value: getable},
            setable: {value: setable},
            factoryValue: {value: factoryValue},
            currentValue: {value: {
                current: currentValue
            }},
            isEnum: {value: false},
            min: {value: min},
            max: {value: max},
            step: {value: step}
        });

        return create(internal);
    };

    createWithValues = function (type, dataType, getable, setable, factoryValue, currentValue, availableValues, supportedValues) {

        var internal = Object.create(internalProto, {
            type: {value: type},
            dataType: {value: dataType},
            getable: {value: getable},
            setable: {value: setable},
            factoryValue: {value: factoryValue},
            currentValue: {value: {
                current: currentValue
            }},
            isEnum: {value: true},
            availableValues: {value: availableValues},
            supportedValues: {value: supportedValues}
        });

        return create(internal);
    };

    create = function (internal) {
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
        createWithValues: {value: createWithValues},
        createWithRange: {value: createWithRange},
        createWithString: {value: createWithString}
    });
});
