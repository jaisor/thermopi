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
    app.use("/public/", express.static(__dirname + '/../public'));
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

        res.redirect('/' + that.sensors.firstSensor().name + '/live/');
    });

    app.get('/:sensor/:period/', function(req, res){
        that.sensors.sensorWithName(req.params.sensor, function (sensor){
            if (sensor) {
                that.localTimeSeries.getTSD(sensor, function (err, tsdRes) {
                    if (err) {
                        console.log("Failed to retrieve last week 5 min values", err);
                    }
                    var tsd = [];
                    tsdRes.forEach(function (key, value) {
                        //tsd.push({timestamp:key[1], value: value});
                    });

                    var timestamp = Date.now();
                    var v = Math.random() * 40 - 10;
                    for(i=-450; i<0; i++) {
                        v += Math.random() * 4 - 2;
                        tsd.push({timestamp: timestamp + i * 1000 * 8, value: v});
                    }

                    res.render('index', {
                        sensors: that.sensors.getSensors(),
                        sensor: sensor,
                        tsd: tsd
                    });
                });
            } else {
                res.send(404, 'Sensor not found');
            }
        });
    });

    app.get('/:sensor/:period/value.json', function(req, res){
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
