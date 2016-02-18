define(["cs!src/charts/coffee/pieChart", "cs!src/charts/coffee/mm", "feathers", "underscore"], function(pieChart, MM, feathers, _) {

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

///////////////////////////////////////////////////////////
    var mm = null;
    var mm_width = 300;
    var mm_height = 300;

    // just sums up values of the turns object.
    function get_total_transitions(turns) {
        return _.reduce(_.values(turns), function(m, n){return m+n;}, 0);
    }

    // transform to the right data to send to chart
    function transform_turns(participants, turns) {
        console.log("transforming turns:", turns);
        turns = _.map(_.pairs(turns), function(t) {
            return {'participant_id': t[0],
                    'turns': t[1]};
        });
        // filter out turns not by present participants
        var filtered_turns = _.filter(turns, function(turn){
            return _.contains(participants, turn.participant_id);
        });
        return filtered_turns;

    }

    // update MM turns if it matches this hangout.
    function maybe_update_mm_turns(data) {
        console.log("mm data:", data);
        if (data.hangout_id == window.gapi.hangout.getHangoutId()) {
            mm.updateData({participants: mm.data.participants,
                           transitions: data.transitions,
                           turns: transform_turns(mm.data.participants, data.turns)});
        } else {
        }
    }

    // update MM participants if it matches this hangout.
    function maybe_update_mm_participants(data) {
        if (data.hangout_id == window.gapi.hangout.getHangoutId()) {
            mm.updateData({participants: data.participants,
                           transitions: mm.data.transitions,
                           turns: mm.data.turns});
        } else {
        }
    }

    function start_meeting_mediator(socket) {
        var app = feathers().configure(feathers.socketio(socket));
        
        var turns = app.service('turns');
        var hangouts = app.service('hangouts');

        hangouts.find({ query:
                        {
                            hangout_id: window.gapi.hangout.getHangoutId()
                        }
                      },
                      function(error, foundhangouts) {
                          if (error) {
                          } else {
                              console.log("found hangout:", foundhangouts[0]);
                              mm = new MM({participants: foundhangouts[0].participants,
                                           transitions: 0,
                                           turns: []},
                                          mm_width,
                                          mm_height);
                              mm.render('#meeting-mediator');
                              turns.on("created", maybe_update_mm_turns);
                              hangouts.on("patched", maybe_update_mm_participants);
                          }
                      }
                     );

        // setTimeout(function() {
        //     mm.updateData(fake_data_2);
        // }, 5000);

        // setTimeout(function() {
        //     mm.updateData(fake_data_3);
        // }, 10000);
    }
    
    return {
        start_pie_chart: start_pie_chart,
        start_meeting_mediator: start_meeting_mediator
    };
});



        // var fake_data = {
        //         'participants': ['uid1', 'uid2', 'uid3'],
        //         'transitions': 2.1,
        //         'turns': [{'participant_id': 'uid1', 'turns': 0.75},
        //                   {'participant_id': 'uid2', 'turns': 0.1},
        //                   {'participant_id': 'uid3', 'turns': 0.15}]
        // };

        // var fake_data_2 = {
        //     'participants': ['uid1', 'uid2', 'uid3', 'uid4'],
        //     'transitions': 2.1,
        //     'turns': [{'participant_id': 'uid1', 'turns': 0.75},
        //               {'participant_id': 'uid2', 'turns': 0.1},
        //               {'participant_id': 'uid3', 'turns': 0.1},
        //               {'participant_id': 'uid4', 'turns': 0.05}]
        // };
        // var fake_data_3 = {
        //     'participants': ['uid1', 'uid2', 'uid3'],
        //     'transitions': 2.1,
        //     'turns': [{'participant_id': 'uid1', 'turns': 0.5},
        //               {'participant_id': 'uid2', 'turns': 0.25},
        //               {'participant_id': 'uid3', 'turns': 0.25}]
        // };
