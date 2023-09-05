// MIT licensed. (C) Dj Walker-Morgan 2018
var BigRedButton = require('./BigRedButton');
const fs = require('fs');
const path = require('path');

// Get the path to the event_actions.json file from command line arguments
const eventActionsPath = process.argv[2] || './event_actions.json';

// Set the environment variable for the event actions file path
process.env.EVENT_ACTIONS_PATH = eventActionsPath;

let eventActions = {};
try {
    const rawData = fs.readFileSync(path.resolve(__dirname, eventActionsPath));
    eventActions = JSON.parse(rawData);
} catch (error) {
    console.error('Failed to load event actions:', error);
}

function configureButton(button) {
  button.on('buttonPressed', function () {
    console.log(eventActions.buttonPressed ? eventActions.buttonPressed.message : 'Button pressed');
    if (eventActions.buttonPressed && eventActions.buttonPressed.executable) {
        require('child_process').exec(eventActions.buttonPressed.executable);
    }
  });

  button.on('buttonReleased', function () {
    console.log(eventActions.buttonReleased ? eventActions.buttonReleased.message : 'Button released');
    if (eventActions.buttonReleased && eventActions.buttonReleased.executable) {
        require('child_process').exec(eventActions.buttonReleased.executable);
    }
  });

  button.on('lidRaised', function () {
    console.log(eventActions.lidRaised ? eventActions.lidRaised.message : 'Lid raised');
    if (eventActions.lidRaised && eventActions.lidRaised.executable) {
        require('child_process').exec(eventActions.lidRaised.executable);
    }
  });
  button.on('lidClosed', function () {
    console.log(eventActions.lidClosed ? eventActions.lidClosed.message : 'Lid closed');
    if (eventActions.lidClosed && eventActions.lidClosed.executable) {
        require('child_process').exec(eventActions.lidClosed.executable);
    }
  });

  button.on('buttonGone', function () {
    console.log('button gone');
    setTimeout(newButton,1000);
  });
}

// Test a new button
function newButton() {
  console.log("Getting button 0")
  try {
    bigRedButton=new BigRedButton.BigRedButton(0);
  }
  catch(err) {
      console.log("No button, waiting");
      setTimeout(newButton,1000);
      return;
  }

  configureButton(bigRedButton);
  console.log("Configured button 0")
  return;
}

newButton();
