var talk_time = require('./talk_time');
var turns = require('./statistics/turns');
var mu = require('./meetingUtils');
var winston = require('winston');
var _ = require('underscore');

var app = require('./app');

////////////////////////////////////////////////////////////////////////////
// SOCKET LISTENERS
////////////////////////////////////////////////////////////////////////////
// hangout::joined
// received when a user joins a hangout.
// provides data:
// participantId, hangout_participants, hangout_id, hangout_url, hangout_topic
// creates a hangout in the db if the hangout doesn't exist
function listenMeetingJoined(socket) {
    socket.on("hangout::joined", function(data) {
        console.log("hangout joined event, data:", data);

        mu.add_user(data.participant_id,
                    data.hangout_id,
                    data.participant_image,
                    data.participant_name,
                    data.participant_locale);

        winston.log("info", "finding hangout with id:", data.hangout_id);
        app.service('meetings').find(
            {
                query: {
                    meetingId: data.hangout_id
                }
            },
            function(error, found_meetings) {
//                winston.log("info", "found ids:", found_meetings);

                // hangout doesn't exist
                if (found_meetings.length == 0) {
                    winston.log('info', "creating a new hangout");
                    // change participants to just their ids
                    data.hangout_participants = _.map(data.hangout_participants, function(p) {
                        return p.participant_id;
                    });
                    mu.createMeeting(data);  // create the hangout
                    talk_time.compute(data.hangout_id);
                    turns.compute(data.hangout_id);

                } else {  // we have a hangout
                    var found_meeting = found_meetings[0];
                    //winston.log('info', "found a hangout:", found_hangout);
                    if ( _.contains(found_meeting.participants, data.participant_id )) {
                        winston.log('info', "participant is in the hangout, nothing happened:",
                                    found_meeting.participants,
                                    data.participant_id);
                    } else {
                        winston.log('info', "participant not currently in hangout, updating participants...");
                        mu.updateHangoutParticipants(found_meeting.hangout_id, data.hangout_participants);
                    }
                }
            });

        // if we now only have one participant, then the hangout started again
        if (data.hangout_participants.length == 1) {
            winston.log("info", "only have one participant now, re-computing talk times...");
            mu.createMeetingEvent(data.hangout_id, 'start', new Date());
            talk_time.compute(data.hangout_id, socket);
            turns.compute(data.hangout_id);
        }
    });
};


var listenParticipantsChanged = function(socket) {
    socket.on("participantsChanged", function(data) {
        winston.log('info', 'Received hangout::participantsChanged event');
        mu.updateHangoutParticipants(data.hangout_id, data.participants);
    });
};

var listenConsentChanged = function(socket) {
    socket.on("consentChanged", function(data) {
        winston.log("info", "consent changed for participant:");

    });
};

// LISTENER REGISTER

function listen(socket) {
    listenMeetingJoined(socket);
    listenParticipantsChanged(socket);
}

module.exports = {
    listen: listen
};
