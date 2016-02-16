define(["cs!src/charts/coffee/pieChart", "cs!src/charts/coffee/mm", "feathers"], function(pieChart, MM, feathers) {

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

    var mm = null;
    var mm_width = 300;
    var mm_height = 300;

    function start_meeting_mediator(socket) {
        var app = feathers().configure(feathers.socketio(socket));
        var mm_data = app.service('mm_data');

        var fake_data = {
                'participants': ['uid1', 'uid2', 'uid3'],
                'transitions': 2.1,
                'turns': [{'participant_id': 'uid1', 'turns': 0.75},
                          {'participant_id': 'uid2', 'turns': 0.1},
                          {'participant_id': 'uid3', 'turns': 0.15}]
        };

        var fake_data_2 = {
            'participants': ['uid1', 'uid2', 'uid3', 'uid4'],
            'transitions': 2.1,
            'turns': [{'participant_id': 'uid1', 'turns': 0.75},
                      {'participant_id': 'uid2', 'turns': 0.1},
                      {'participant_id': 'uid3', 'turns': 0.1},
                      {'participant_id': 'uid4', 'turns': 0.05}]
        };
        mm = new MM(fake_data, mm_width, mm_height);
        mm.render('#meeting-mediator');
        setTimeout(function() {
            mm.updateData(fake_data_2);
        }, 5000);
    }
    
    return {
        start_pie_chart: start_pie_chart,
        start_meeting_mediator: start_meeting_mediator
    };
});
