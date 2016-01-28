define(["cs!src/charts/coffee/pieChart", "cs!src/charts/coffee/loadingPie", "feathers"], function(pieChart, loadingPie, feathers) {

    var pie_chart = null;
    var pie_chart_width = 300;
    var pie_chart_height = 300;

    // updates the pie chart with data!
    function maybe_update_pie_chart(data) {
        console.log("Maybe updating pie chart with data:", data);
        if (data.hangout_id == window.gapi.hangout.getHangoutId()) {
            if (pie_chart.loading) {
                // have to call loadData before on change.
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

        // use this for when you first create the pie chart
        var fake_data = [{'participant_id': local_participant, 'seconds_spoken': 1}];
        pie_chart = new pieChart(fake_data, local_participant, pie_chart_width, pie_chart_height);
        pie_chart.render('#pie-chart');
        
        // update the pie chart when we get new talk times
        talktimes.on("created", maybe_update_pie_chart);
    }
    
    return {
        start_pie_chart: start_pie_chart
    };
});
