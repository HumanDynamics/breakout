var services = require('./services');
var talk_time = require('./talk_time');
var hu = require('./hangout_utils');
var winston = require('winston');
var _ = require('underscore');

////////////////////////////////////////////////////////////////////////////
// SOCKET LISTENERS
////////////////////////////////////////////////////////////////////////////
// hangout::joined
// received when a user joins a hangout.
// provides data:
// participantId, hangout_participants, hangout_id, hangout_url, hangout_topic
// creates a hangout in the db if the hangout doesn't exist
function listenHangoutJoined(socket) {
    socket.on("hangout::joined", function(data) {
        console.log("hangout joined event, data:", data);

        hu.add_user(data.participant_id, data.hangout_id,
                    data.participant_image, data.participant_name,
                    data.participant_locale);

        winston.log("info", "finding hangout with id:", data.hangout_id);
        services.hangoutService.find(
            {
                query: {
                    hangout_id: data.hangout_id
                }
            },
            function(error, found_hangouts) {
                winston.log("info", "found ids:", found_hangouts);

                // hangout doesn't exist
                if (found_hangouts.length == 0) {
                    winston.log('info', "creating a new hangout");
                    // change participants to just their ids
                    data.hangout_participants = _.map(data.hangout_participants, function(p) {
                        return p.participant_id;
                    });
                    hu.createHangout(data);  // create the hangout
                    talk_time.compute_talk_times(data.hangout_id);

                } else {  // we have a hangout
                    var found_hangout = found_hangouts[0];
                    winston.log('info', "found a hangout:", found_hangout);
                    if ( _.contains(found_hangout.participants, data.participant_id )) {
                        winston.log('info', "participant is in the hangout, nothing happened:",
                                    found_hangout.participants,
                                    data.participant_id);
                    } else {
                        winston.log('info', "participant not currently in hangout, updating participants...");
                        hu.updateHangoutParticipants(found_hangout.hangout_id, data.hangout_participants);
                    }
                }
            });

        // if we now only have one participant, then the hangout started again
        if (data.hangout_participants.length == 1) {
            winston.log("info", "only have one participant now, re-computing talk times...");
            hu.createHangoutEvent(data.hangout_id, 'start', new Date());
            talk_time.compute_talk_times(data.hangout_id);
        }
    });
};


var listenParticipantsChanged = function(socket) {
    socket.on("participantsChanged", function(data) {
        winston.log('info', 'Received hangout::participantsChanged event');
        hu.updateHangoutParticipants(data.hangout_id, data.participants);
    });
};

// var listenTimeSpokenSince = function(socket) {
//     socket.on("timeSpokenSince", function(data) {
//         winston.log("info", "received timeSpokenSince event");
//         talk_time.time_spoken_since(data.from_time, data.participant_ids, data.hangout_id);
//     });
// };


// LISTENER REGISTER

function listen(socket) {
    listenHangoutJoined(socket);
    listenParticipantsChanged(socket);
}

module.exports = {
    listen: listen
};
