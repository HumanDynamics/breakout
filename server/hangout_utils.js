var winston = require('winston');
var talk_time = require('./talk_time');
var turns = require('./statistics/turns');

var _ = require('underscore');

var app = require('./app');


// creates a new hangout with the given data.
// `hangout` must have the following keys:
// hangout_id, hangout_url, hangout_topic, hangout_participants
function createHangout(hangout) {
    app.service('hangouts').create(
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


// create a hangout event.
// 'event' must be one of: 'start' | 'end'
function createHangoutEvent(hangout_id, event, timestamp) {
    app.service('hangout_events').create(
        {
            hangout_id: hangout_id,
            event: event,
            timestamp: timestamp
        },
        {},
        function (error, data) {
            if (error) {
            } else {
                winston.log('info', "Added hangout start event");
            }
        }
    );
}


// create a participant event
// participant_ids must be a list of google person IDs.
function createParticipantEvent(participant_ids, hangout_id, timestamp) {
    app.service('participant_events').create(
        {
            participant_ids: participant_ids,
            hangout_id: hangout_id,
            timestamp: timestamp
        }, function(error, data) {
            if (error) {
            } else {
                winston.log("info", "created new participant event for hangout", hangout_id);
            }
        });
}


// adds a given user (participant_id) to the database.
// users are considered uniqe by 'participnt_id' and 'hangout_id' - 
// we may have the same participant_id twice, by different hangouts.
// if the user already is recorded for that hangout, do nothing.
function add_user(participant_id, hangout_id, image_url, name, locale) {
    winston.log("info", "add user:", participant_id, name);
    app.service('participants').find(
        {
            query: {
                $and: [{participant_id: participant_id},
                       {hangout_id: hangout_id}]
            }
        },
        // {
        //     $and: [{'participant_id': participant_id},
        //            { 'hangout_id': hangout_id}]
        // },
        function(error, data) {
            if (error) {
                return;
            }
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
                winston.log("info", "creating new participant:", participant_id, name);
                app.service('participants').create(
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


// Gets called on hangout::participantsChanged
// updates the participant list for the given hangout ID.
// 
function updateHangoutParticipants(hangoutId, new_participants) {
    winston.log("info", "updating hangout participants:", hangoutId, new_participants);
    app.service('hangouts').find(
        {
            query: {
                hangout_id: hangoutId,
                $limit: 1
            }
        },
        function(error, foundHangouts) {
            if (error) {
            } else {
                var hangout = foundHangouts[0];

                var new_participant_ids = _.map(new_participants, function(p) {
                    return p.participant_id;
                });
                
                // log the participant changed event
                createParticipantEvent(new_participant_ids, hangoutId, new Date());

                // add any new participants to the database
                _.each(new_participants, function(p) {
                    winston.log("info", "new participants:", p);
                    add_user(p.participant_id, p.hangout_id, p.image_url, p.name, p.locale);
                });

                // patch this hangout to have the most recent participant list
                // if it has 0 participants, mark it inactive, and save the end time.
                // if it has > 0 participants, mark it active and set end time to null.
                var active = (new_participant_ids.length > 0);
                var end_time = null;
                if (!active) {
                    end_time = new Date();
                    talk_time.stop(hangoutId);
                    turns.stop(hangoutId);
                } else if (!hangout.active && active) {
                    // if hangout is moving from inactive to active...
                    winston.log("info", "starting computing talk times...");
                    talk_time.compute(hangout.hangout_id);
                    turns.compute(hangout.hangoutId);
                }
                app.service('hangouts').patch(
                    hangout._id,
                    {
                        participants: new_participant_ids,
                        active: active,
                        end_time: end_time
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


module.exports = {
    add_user: add_user,
    updateHangoutParticipants: updateHangoutParticipants,
    createParticipantEvent: createParticipantEvent,
    createHangoutEvent: createHangoutEvent,
    createHangout: createHangout
};
