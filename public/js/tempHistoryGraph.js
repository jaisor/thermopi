function tempHistoryGraph(temp) {

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    $('#tempHistory').highcharts({
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            zoomType: 'x',
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'datetime',
            minRange: 1000 * 60 // 1 hour
        },
        yAxis: {
            title: {
                text: null
            },
            labels: {
                useHTML: true,
                formatter: function () {
                    var c = this.value,
                        f = c * 1.8 + 32.0;
                    return Math.round(c*10)/10 + '&deg;C/' + Math.round(f*10)/10 + '&deg;F';
                }
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ' m/s'
        },
        plotOptions: {
            spline: {
                lineWidth: 3,
                marker: {
                    enabled: true
                },
            }
        },
        series: [{
            name: 'Temperature',
            color: '#FF9655',
            data: (function() {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;

                    data.push({
                        x: time,
                        y: temp
                    });

                    return data;
                })()

        }],
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    },

    function(chart) {
        // Request sensor observation
        $.sensorObservers.push( function(data) {
            var x = (new Date()).getTime();
            chart.series[0].addPoint([Date.now(), data.value], true, false);
        });    
    });
}