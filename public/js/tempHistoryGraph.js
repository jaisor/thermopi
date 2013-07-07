$(function () {

    $('#tempHistory').highcharts({
        chart: {
            type: 'spline'
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Wind speed (m/s)'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
        },
        tooltip: {
            valueSuffix: ' m/s'
        },
        plotOptions: {
            spline: {
                lineWidth: 4,
                states: {
                    hover: {
                        lineWidth: 5
                    }
                },
                marker: {
                    enabled: false
                },
                pointInterval: 3600000, // one hour
                pointStart: Date.UTC(2009, 9, 6, 0, 0, 0)
            }
        },
        series: [{
            name: 'Temp',
            data: [4.3, 5.1, 4.3, 5.2, 5.4, 4.7, 3.5, 4.1, 5.6, 7.4, 6.9, 7.1,
                7.9, 7.9, 7.5, 6.7, 7.7, 7.7, 7.4, 7.0, 7.1, 5.8, 5.9, 7.4,
                8.2, 8.5, 9.4, 8.1, 10.9, 10.4, 10.9, 12.4, 12.1, 9.5, 7.5,
                7.1, 7.5, 8.1, 6.8, 3.4, 2.1, 1.9, 2.8, 2.9, 1.3, 4.4, 4.2,
                3.0, 3.0]

        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
});