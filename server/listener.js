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


function add_user(participant_id, hangout_id, image_url, name, locale) {
    winston.log("info", "add user:", participant_id, name);
    services.participantService.find(
        {'participant_id': participant_id},
        // {
        //     $and: [{'participant_id': participant_id},
        //            { 'hangout_id': hangout_id}]
        // },
        function(error, data) {
            if (error) {
                return;
            }
            winston.log("info", "got participant data back:", data);

            // we have to get all the matching records for this
            // participant because I can't figure out how to get
            // '$and' working correctly w/ mongo....
            var matching_records = _.filter(data, function(participant) {
                return participant.participant_id == participant_id &&
                    participant.hangout_id == hangout_id;
            });

            if (matching_records.length > 0) {
                winston.log("info", "already have participant by id:", participant_id);
                return;
            } else { // we don't, add it.
                winston.log("info", "adding new participant:", participant_id, name);
                services.participantService.create(
                    {
                        'participant_id': participant_id,
                        'hangout_id': hangout_id,
                        'image_url': image_url,
                        'name': name,
                        'locale': locale
                    }, {}, function(error, data) {
                        
                    });
            }
        });
}


//TODO:
// problem is that when someone joins, the hangout object does not have their ID in some cases
// ALSO it does not get marked as inactive when a user leaves a hangout.


// Gets called on hangout::participantsChanged
function updateHangoutParticipants(hangoutId, new_participants) {
    services.hangoutService.find(
        {
            hangout_id: hangoutId,
            $limit: 1
        },
        function(error, foundHangouts) {
            if (error) {
            } else {
                var hangout = foundHangouts[0];

                var new_participant_ids = _.map(new_participants, function(p) {
                    return p.participant_id;
                });
                // log the participant changed event
                services.participantEventService.create(
                    {
                        participant_ids: new_participant_ids,
                        hangout_id: hangoutId,
                        timestamp: new Date()
                    }, function(error, data) {
                    });

                _.each(new_participants, function(p) {
                    winston.log("info", "Adding new participant:", p.name);
                    //TODO
                    add_user(p.participant_id, p.hangout_id, p.image_url, p.name, p.locale);
                });

                // patch this hangout to have the most recent participant list
                // if it has 0 participants, mark it inactive.
                services.hangoutService.patch(
                    hangout._id,
                    {
                        participants: new_participant_ids
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

// hangout::joined
// received when a user joins a hangout.
// provides data:
// participantId, hangout_participants, hangout_id, hangout_url, hangout_topic
// creates a hangout in the db if the hangout doesn't exist
function listenHangoutJoined(socket) {
    socket.on("hangout::joined", function(data) {
        console.log("hangout joined event, data:", data);

        add_user(data.participant_id, data.hangout_id,
                 data.participant_image, data.participant_name,
                 data.participant_locale);

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
