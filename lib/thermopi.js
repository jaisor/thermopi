var express = require('express'),
    engines = require('consolidate'),
    fs = require('fs'),
    exec = require('child_process').exec,
    Sensors = require('./sensors'),
    TimeSeries = require('./timeseries'),
    merge = require('merge');

var DEFAULT_CONFIG = {
    port: 3000,
    mockable: false,
    onSensorUpdate: false
};

module.exports = ThermoPi;

function ThermoPi(config) {

    var app = express(),
        that = this;

    merge(DEFAULT_CONFIG, config);

    app.set('views', __dirname + '/../views');
    app.set('view options', {layout: false});
    app.set('view engine', 'html');
    app.use("/public", express.static(__dirname + '/../public'));
    app.engine('html', engines.hogan);

    this.localTimeSeries = new TimeSeries();
    this.sensors = new Sensors({
        mockable: config.mockable,
        onSensorUpdate: function(sensor){
            that.localTimeSeries.store(sensor);
        }
    });

    app.get('/', function(req, res){
        if (!that.sensors.hasSensors()) {
            res.send(500, 'No sensors found');
            return;
        }

        res.redirect('/' + that.sensors.firstSensor().name + '/');
    });

    app.get('/:sensor/', function(req, res){
        that.sensors.sensorWithName(req.params.sensor, function (sensor){
            if (sensor) {
                res.render('index', {
                    sensors: that.sensors.getSensors(),
                    sensor: sensor
                });
            } else {
                res.send(404, 'Sensor not found');
            }
        });
    });

    app.get('/:sensor/value.json', function(req, res){
        that.sensors.sensorWithName(req.params.sensor, function (sensor){
            if (sensor) {
                res.json({ 'value': sensor.value });
            } else {
                res.send(404, { error: 'Sensor not found' });
            }
        });
    });

    app.listen(config.port);
    console.log('Server started on port %s', config.port);
}
