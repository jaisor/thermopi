var fs = require('fs'),
    exec = require('child_process').exec;

var W1PATH = '/sys/bus/w1/devices/'; 

module.exports = Sensors;

function Sensors() {
    var files = [];

    if (this._isMock()) {
        // Mock
        console.log('Mocking sensors');

        this.sensors = [{
                name: "sensor1",
                path: "/tmp/sensor1",
                value: 12.3
            },
            {
                name: "sensor2",
                path: "/tmp/sensor2",
                value: 14.3
            },
            {
                name: "sensor3",
                path: "/tmp/sensor3",
                value: 17.3
            }];
    } else {
        // Real
        this.sensors = [];

        files = fs.readdirSync(W1PATH);
        files.forEach(function (f) {
            if (f.indexOf('w1_bus_master') == 0) {
                return;
            } 

            var w1_sensor = W1PATH + f + "/w1_slave";
            
            var sensor = {
                name: f,
                path: w1_sensor,
                value: null
            };

            this._readSensorAtPath(w1_sensor, function(value) {
                sensor.value = value;
            });

            console.log("Found sensor at: " + w1_sensor);
            this.sensors.push(sensor);
        });
    }

    setInterval(this._updateValues, 2000, this);
}

Sensors.prototype.hasSensors = function(){
    return this.sensors.length > 0;
}

Sensors.prototype.getSensors = function(){
    return this.sensors;
}

Sensors.prototype.firstSensor = function(){
    return this.sensors[0];
}

Sensors.prototype.sensorWithName = function(name, callback){
    var sensor = null;
    this.sensors.forEach(function (f) {
        if (f.name == name) {
            sensor = f;
            return false;
        }
    });
    callback(sensor);
}

Sensors.prototype._readSensor = function(sensor, callback){
    if (this._isMock()) {
        // Mock
        console.log('Mocking value for sensor ' + sensor.name);
        callback(Math.random() * 40 - 10);
        return;
    }

    sensor._readSensorAtPath(sensor.path, callback);
}

Sensors.prototype._readSensorAtPath = function(path, callback){
    exec("cat " + path + " | grep t= | cut -f2 -d= | awk '{print $1/1000}'", function( error, stdout, stderr ) {
        if (error) { callback(error); }
        callback( parseFloat(stdout).toFixed(2) );
    });
}

Sensors.prototype._updateValues = function(that){
    that.sensors.forEach(function (f) {
        that._readSensor(f, function (value){
            f.value = value;
        })
    });
    //console.log("Values updated");
}

Sensors.prototype._isMock = function() {
    return !(fs.existsSync(W1PATH) && fs.statSync(W1PATH).isDirectory());   
}