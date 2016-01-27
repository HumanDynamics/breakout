define(["cs!src/charts/coffee/pieChart", "feathers"], function(pieChart, feathers) {

    var pie_chart = null;
    var pie_chart_width = 300;
    var pie_chart_height = 300;

    function maybe_update_pie_chart(data) {
        console.log("Maybe updating pie chart with data:", data);

        if (data.hangout_id == window.gapi.hangout.getHangoutId()) {
            if (!pie_chart) {
                pie_chart = new pieChart(data.talk_times, pie_chart_width, pie_chart_height);
                pie_chart.render('#pie-chart');
            } else {
                console.log("updating pie chart...");
                pie_chart.change(data.talk_times);
            }
        }
    }

    function start_pie_chart(socket) {
        var app = feathers().configure(feathers.socketio(socket));
        var talktimes = app.service('talk_times');
        console.log("service:", talktimes);
        talktimes.on("created", maybe_update_pie_chart);
    }
    
    return {
        start_pie_chart: start_pie_chart
    };
});
