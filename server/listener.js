var services = require('./services');
var winston = require('winston');
var _ = require('underscore');

// register all listening functions

// UTILITY FUNCTIONS

// creates a new hangout with the given data.
// `hangout` must have the following keys:
// hangout_id, hangout_url, hangout_topic, hangout_participants
function createHangout(hangout) {
    services.hangoutService.create(
        {
            hangout_id: hangout.hangout_id,
            url: hangout.hangout_url,
            topic: hangout.hangout_topic,
            active: true,
            participants: hangout.hangout_participants,
            end_time: null
        }, {}, function(error, data) {
            if (!error) {
                console.log("Successfully created hangout, ", hangout.hangout_id);
            }
        });
}


// SPECIFIC LISTENERS

// hangout::joined
// received when a user joins a hangout.
// provides data:
// participantId, hangout_participants, hangout_id, hangout_url, hangout_topic
// creates a hangout in the db if the hangout doesn't exist
function listenHangoutJoined(socket) {
    socket.on("hangout::joined", function(data) {
        console.log("hangout joined event, data:", data);

        services.hangoutService.find(
            {
                hangout_id: data.hangout_id,
                $limit: 1
            },
            function(error, foundHangouts) {
                if (foundHangouts.length == 0) {
                    // hangout doesn't exist
                    winston.log('info', "creating a new hangout");
                    createHangout(data);
                } else {
                    var hangout = foundHangouts[0];
                    winston.log('info', "found a hangout:", error, hangout);
                    if ( _.contains(hangout.participants, data.participant_id )) {
                        winston.log('info', "participant is in the hangout, nothing happened:",
                                    hangout.participants,
                                    data.participant_id);
                    } else {
                        winston.log('info', "participant not currently in hangout, updating participants...");
                        updateHangoutParticipants(hangout.hangout_id, data.hangout_participants);
                    }
                }
            });
    });
};


function updateHangoutParticipants(hangoutId, new_participants) {
    winston.log('info', 'I made it to the update function', hangoutId, new_participants);
    services.hangoutService.find(
        {
            hangout_id: hangoutId,
            $limit: 1
        },
        function(error, foundHangouts) {
            if (error) {
            } else {
                var hangout = foundHangouts[0];

                // log the participant changed event
                services.participantEventService.create(
                    {
                        participants: new_participants,
                        hangout_id: hangoutId,
                        timestamp: new Date()
                    }, function(error, data) {
                    });

                // patch this hangout to have the most recent participant list
                services.hangoutService.patch(
                    hangout._id,
                    {
                        participants: new_participants
                    },
                    {},
                    function(error, data) {
                        if (error) {
                            winston.log('error', 'Could not update participant list for hangout' + data.hangoutId);
                        } else {
                            winston.log('debug', 'Updated participant list for hangout' + data.hangoutId + 'to' + data.participants);
                        }
                    }
                );
            }
        });
};

var listenParticipantsChanged = function(socket) {
    socket.on("participantsChanged", function(data) {
        winston.log('info', 'Received hangout::participantsChanged event');
        updateHangoutParticipants(data.hangout_id, data.participants);
    });
};


// LISTENER REGISTER

function listen(socket) {
    listenHangoutJoined(socket);
    listenParticipantsChanged(socket);
}

module.exports = {
    listen: listen
};
