function currentTempGauge(temp) {

    var perShapeGradient = {
            x1: 0,
            y1: 1,
            x2: 0,
            y2: 0
        };

    $('#currentTemp').highcharts({
        chart: {
            type: 'gauge',
            alignTicks: false,
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
        },
        credits: {
            enabled: false
        },
        title: {
            text: null
        },
        tooltip: {
            enabled: false
        },
        pane: {
            startAngle: -150,
            endAngle: 150,
            background: null
        },          
        yAxis: [{
            min: -40,
            max: 80,
            lineColor: '#666',
            offset: -25,
            lineWidth: 2,
            labels: {
                distance: -20,
                rotation: 'auto'
            },
            tickLength: 5,
            minorTickLength: 3,
            endOnTick: false,
            plotBands: [{
                from: -40,
                to: 20,
                color: {
                    linearGradient: perShapeGradient,
                    stops: [
                        [0, '#3366FF'],
                        [1, '#33FF66']
                    ]
                },
                innerRadius: '81%',
                outerRadius: '85%',
            }, {
                from: 20,
                to: 50,
                color: {
                    linearGradient: perShapeGradient,
                    stops: [
                        [0, '#FF3333'],
                        [1, '#33FF66']
                    ]
                },
                innerRadius: '81%',
                outerRadius: '85%',
            }, {
                from: 50,
                to: 80,
                color: '#FF3333',
                innerRadius: '81%',
                outerRadius: '85%',
            }]     
        }, {
            min: -40,
            max: 176,
            tickPosition: 'outside',
            lineColor: '#666',
            lineWidth: 2,
            minorTickPosition: 'outside',
            tickLength: 5,
            minorTickLength: 3,
            labels: {
                distance: 8,
                rotation: 'auto'
            },
            offset: -15,
            endOnTick: false
        }],
        series: [{
            name: 'Temperature',
            data: [temp],
            dataLabels: {
                useHTML: true,
                style: {
                    fontWeight:'bold',
                    fontSize:'1.4em',
                },
                borderWidth: 0,
                y: +20,
                formatter: function () {
                    var c = this.y,
                        f = c * 1.8 + 32.0;
                    return Math.round(c*10)/10 + '&deg;C/' + Math.round(f*10)/10 + '&deg;F';
                }
            }
        }]
    
    },

    // Check the temperature periodically
    function(chart) {
        setInterval(function() {
            var point = chart.series[0].points[0];
                
            $.get('temp.json', function(data) {
                point.update(parseFloat(data.temp));
            });
    
        }, 2000);
    
    });
};