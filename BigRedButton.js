const HID = require('node-hid');
const util = require('util');
const events = require('events');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // Import the exec function from child_process module

let allDevices;
const cmdStatus = Buffer.from([0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02]);
let lastState;

const LID_DOWN = 0x15, LID_UP = 0x17, BUTTON_DOWN = 0x16;

function getAllDevices() {
    allDevices = HID.devices(7476, 13);
    return allDevices;
}


function BigRedButton(index, eventActions = {}) {

    if (!arguments.length) {
        index = 0;
    }

    const bigRedButton = getAllDevices();
    if (!bigRedButton.length) {
        throw new Error("No BigRedButton could be found");
    }

    if (index > bigRedButton.length || index < 0) {
        throw new Error(`Index ${index} out of range, only ${bigRedButton.length} BigRedButton found`);
    }

    this.button = bigRedButton[index];
    this.hid = new HID.HID(bigRedButton[index].path);

    this.hid.write(cmdStatus);

    const that = this;
    this.hid.read(function (error, data) {
        lastState = data[0];
        that.hid.read(that.interpretData.bind(that));
    });

    this.interval = setInterval(this.askForStatus.bind(this), 100);
    this.close = function () {
        clearInterval(this.interval);
        this.interval = false;
        setTimeout(() => {
            this.hid.close();
        }, 100);
        this.emit("buttonGone");
    };
}

util.inherits(BigRedButton, events.EventEmitter);

BigRedButton.prototype.askForStatus = function () {
    try {
        this.hid.write(cmdStatus);
    } catch (e) {
        this.close();
    }
};

BigRedButton.prototype.interpretData = function (error, data) {
    if (!this.interval || error || !data) {
        this.close();
        return;
    }
    const newState = data[0];

    if (lastState !== newState) {
        if (lastState === LID_DOWN && newState === LID_UP) {
            this.emit("lidRaised");
            exec('echo Lid Raised'); // Execute Windows command here
        } else if (lastState === LID_UP && newState === BUTTON_DOWN) {
            this.emit("buttonPressed");
            exec('echo Button Pressed'); // Execute Windows command here
        } else if ((lastState === BUTTON_DOWN && newState === LID_UP) || (lastState === BUTTON_DOWN && newState === LID_DOWN)) {
            this.emit("buttonReleased");
            exec('echo Button Released'); // Execute Windows command here
        } else if (lastState === LID_UP && newState === LID_DOWN) {
            this.emit("lidClosed");
            exec('echo Lid Closed'); // Execute Windows command here
        }
        lastState = newState;
    }

    this.hid.read(this.interpretData.bind(this));
};

BigRedButton.prototype.isLidUp = function () {
    return lastState === LID_UP || lastState === BUTTON_DOWN;
};

BigRedButton.prototype.isButtonPressed = function () {
    return lastState === BUTTON_DOWN;
};

BigRedButton.prototype.isLidDown = function () {
    return lastState === LID_DOWN;
};

exports.BigRedButton = BigRedButton;
exports.deviceCount = function () {
    return getAllDevices().length;
};
