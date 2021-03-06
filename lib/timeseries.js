var merge = require('merge'),
    cradle = require('cradle');

var DEFAULT_CONFIG = {
    host: "http://127.0.0.1",
    port: "5984",
    cache: true,
    raw: false,
    db_name: "thermopi"
};

module.exports = TimeSeries;

function TimeSeries(config) {
    var that = this;

    this.config = merge(DEFAULT_CONFIG, config);

    this.db = new(cradle.Connection)(this.config.host, this.config.port, {
        cache: this.config.cache,
        raw: this.config.raw
    }).database(this.config.db_name);

    this.db.exists(function (err, exists) {
        if (err) {
            throw err;
        } else if (exists) {
            console.log('TimeSeries initialized');
        } else {
            console.log('Initializing TimeSeries');
            that.db.create();
            // TODO: Add Views
        }

        that.db.save('_design/tsd', {
            fiveMinutes: {
                map: function(doc) {
                    if (doc.period == "FiveMinutes") {
                        emit([doc.sensor, doc.timestampUnix], doc.value);
                    }
                }
            }
        });
    });

    this.tsdFiveMinutes = {};
    this.tsdOneHour = {};
}

TimeSeries.prototype.store = function(sensor){

    var newSensor = merge(true, sensor);

    if (!(newSensor.name in this.tsdFiveMinutes)) {
        this.tsdFiveMinutes[newSensor.name] = [newSensor];
    } else if (this.tsdFiveMinutes[newSensor.name].length == 0) {
        // First value
        this.tsdFiveMinutes[newSensor.name] = [newSensor];
    } else {
        var first = this.tsdFiveMinutes[newSensor.name][0];
        if (newSensor.timestamp - first.timestamp < 300000) {
            // Within 5 minutes
            this.tsdFiveMinutes[newSensor.name].push(newSensor);
        } else {
            // Save and start a new array
            this._storeFiveMinutes(this.tsdFiveMinutes[newSensor.name]);
            this.tsdFiveMinutes[newSensor.name] = [newSensor];
        }
    }
}

TimeSeries.prototype.getTSD = function(sensor, callback, options){
    var matches;
    var now = new Date();
    var realOptions = merge({
        start: now.setDate(now.getDate()-1), // last 24 hours
        end: Date.now(),
        period: "fiveMinutes"
    }, options);

    this.db.view("tsd/" + realOptions.period, { 
        startkey: [sensor.name, realOptions.start],
        endkey: [sensor.name, realOptions.end]
    }, callback);
}

TimeSeries.prototype._storeFiveMinutes = function(sensorArray){
    
    var sum = 0;
    sensorArray.forEach(function(f){
        return sum += f.value;
    });

    var avg = sum / sensorArray.length,
        sensor = sensorArray[0];

    //console.log('Storing sensor ' + sensor.name + ' FiveMinutes value of ' + avg + '  with timestamp ' + sensor.timestamp);

    this.db.save(sensor.name + '-' + sensor.timestamp, {
        sensor: sensor.name,
        value: avg,
        timestampUnix: sensor.timestamp,
        timestamp: new Date(sensor.timestamp).toISOString(),
        period: 'FiveMinutes',
    }, function (err, res) {
        if (err) {
            console.log("Failed to store 5 min timeseries", err);
        }
    });

    // TODO: this.tsdOneHour.push();
}
