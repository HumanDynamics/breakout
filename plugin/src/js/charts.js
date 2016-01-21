define(["cs!src/charts/coffee/pieChart", "feathers"], function(pieChart, feathers) {

    var pie_chart = null;
    var pie_chart_width = 400;
    var pie_chart_height = 400;

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
        console.log("starting pie chart with empty data...");
        console.log("piechart:", pieChart);
        socket.on("talktimes created", maybe_update_pie_chart);
    }
    
    return {
        start_pie_chart: start_pie_chart
    };
});
