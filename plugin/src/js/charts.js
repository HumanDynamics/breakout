define(["cs!src/charts/coffee/pieChart", "cs!src/charts/coffee/loadingPie", "feathers"], function(pieChart, loadingPie, feathers) {

    var pie_chart = null;
    var pie_chart_width = 300;
    var pie_chart_height = 300;

    function maybe_update_pie_chart(data) {
        console.log("Maybe updating pie chart with data:", data);
        if (data.hangout_id == window.gapi.hangout.getHangoutId()) {
            if (pie_chart.loading) {
                console.log("it's rotating, stop it!");
                pie_chart.loadData(data.talk_times);
            } else {
                pie_chart.change(data.talk_times);
            }
        }
    }

    function start_pie_chart(socket) {
        var app = feathers().configure(feathers.socketio(socket));
        var talktimes = app.service('talk_times');
        
        var local_participant = window.gapi.hangout.getLocalParticipant().person.id;
        
        var fake_data = [{'participant_id': local_participant, 'seconds_spoken': 0},
                         {'participant_id': '0', 'seconds_spoken': 100}];
        pie_chart = new pieChart(fake_data, local_participant, pie_chart_width, pie_chart_height);
        pie_chart.render('#pie-chart');

        console.log("service:", talktimes);
        talktimes.on("created", maybe_update_pie_chart);
    }
    
    return {
        start_pie_chart: start_pie_chart
    };
});
