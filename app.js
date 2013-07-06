var express = require('express'),
	engines = require('consolidate'),
	fs = require('fs'),
	exec = require('child_process').exec,
	app = express();

app.set('views', __dirname + '/views');
app.set('view options', {layout: false});
app.set('view engine', 'html');
app.use("/assets", express.static(__dirname + '/assets'));
app.engine('html', engines.hogan);

var currentTemp = Math.random() * 10 + 10;
var serverPort = 3000;

function startServer(sensors, port) {

	console.log("Starting with sensors:" + JSON.stringify(sensors));

	app.get('/', function(req, res){
		var sensor;

		if (sensors == null || sensors.length == 0) {
			res.send(500, 'No sensors found');
			return;
		}

		sensor = sensors[0];
		res.redirect('/' + sensor.name + '/');
	});

	app.get('/:sensor/', function(req, res){
		var sensor = null;

		sensors.forEach(function (f) {
			if (f.name == req.params.sensor) {
				sensor = f;
				return false;
			}
		});

		if (sensor) {
			res.render('index', {
		    	sensors: sensors,
		    	sensor: sensor
		   	});
		} else {
			res.send(404, 'Sensor not found');
		}
		
	});

	app.get('/:sensor/temp.json', function(req, res){

		var sensor = null;

		sensors.forEach(function (f) {
			if (f.name == req.params.sensor) {
				sensor = f;
				return false;
			}
		});

		if (sensor) {
			getSensorTemp(sensor.location, function(temp) {
				res.json({ 'temp': temp })
			});
		} else {
			res.send(404, { error: 'Sensor not found' });
		}
	});

	app.listen(port);
	console.log('Server started on port %s', port);
}

function scanSensorts() {
	var w1 = "/sys/bus/w1/devices/";
	var sensors = [];

/*
	return [{
				name: "sensor1",
				location: "/tmp/sensor1",
				temp: 12.3
			},
			{
				name: "sensor2",
				location: "/tmp/sensor2",
				temp: 14.3
			},
			{
				name: "sensor3",
				location: "/tmp/sensor3",
				temp: 17.3
			}];
			*/

	var files = fs.readdirSync(w1);
	files.forEach(function (f) {
		if (f.indexOf('w1_bus_master') == 0) {
			return;
		} 

		var w1_sensor = w1 + f + "/w1_slave";
		
		var sensor = {
			name: f,
        	location: w1_sensor,
        	temp: null
        };

        getSensorTemp(w1_sensor, function(temp) {
        	sensor.temp = temp;
        });

        sensors.push(sensor);
	});

	return sensors;
}

function getSensorTemp(sensor, callback) {
	
	// callback(Math.random() * 20 - 20);

	exec("cat " + sensor + " | grep t= | cut -f2 -d= | awk '{print $1/1000}'", function( error, stdout, stderr ) {
        if (error) throw error;
        callback( parseFloat(stdout).toFixed(2) );
        
	});
}

startServer(scanSensorts(), serverPort);
