var express = require('express'),
    engines = require('consolidate'),
    fs = require('fs'),
    exec = require('child_process').exec,
    Sensors = require('./lib/sensors'),
    app = express(),
    port = 3000;

app.set('views', __dirname + '/views');
app.set('view options', {layout: false});
app.set('view engine', 'html');
app.use("/public", express.static(__dirname + '/public'));
app.engine('html', engines.hogan);

var serverPort = 3000;
var sensors = new Sensors();

app.get('/', function(req, res){
    var sensor;

    if (!sensors.hasSensors()) {
        res.send(500, 'No sensors found');
        return;
    }

    res.redirect('/' + sensors.firstSensor().name + '/');
});

app.get('/:sensor/', function(req, res){
    
    sensors.sensorWithName(req.params.sensor, function (sensor){
        if (sensor) {
            res.render('index', {
                sensors: sensors.getSensors(),
                sensor: sensor
            });
        } else {
            res.send(404, 'Sensor not found');
        }
    });
    
});

app.get('/:sensor/value.json', function(req, res){

    sensors.sensorWithName(req.params.sensor, function (sensor){
        if (sensor) {
            res.json({ 'value': sensor.value });
        } else {
            res.send(404, { error: 'Sensor not found' });
        }
    });

});

app.listen(port);
console.log('Server started on port %s', port);
