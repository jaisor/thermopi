## Purpose

The purpose of this node module is to provide web UI for a DS18B20 device available via W1 GPIO.
Popilar applications are using the Raspberry Pi computer. Examples:

http://www.raspberrypi-spy.co.uk/2013/03/raspberry-pi-1-wire-digital-thermometer-sensor/
http://learn.adafruit.com/adafruits-raspberry-pi-lesson-11-ds18b20-temperature-sensing/hardware
http://raspbrew.tumblr.com/

## Install

ThermoPi requires CoachDb to be installed and available on port 5984.
Afterwards just run

    npm install thermopi

## Usage 

The module supports mocking in the absence of a connected W1 thermometer. 
You can launch the module from node directly:

	node index.js

Or you can execute the provided binary

	./bin/thermopi -p 3000; # Connect to port 80, see -h for more options