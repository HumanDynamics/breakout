var winston = require('winston');
var _ = require('underscore');

var talk_time = require('./talk_time');
var turns = require('./statistics/turns');
var app = require('./app');


// creates a new meeting with the given data.
// `meeting` must have the following keys:
// meeting_id, participants
function createMeeting(meeting) {
    app.service('meetings').create(
        {
            _id: meeting.meeting_id,
            active: true,
            participants: meeting.participants,
            end_time: null
        }, {}, function(error, data) {
            if (!error) {
                console.log("Successfully created meeting, ", meeting.meetingId);
            }
        });
}


// create a meeting event.
// 'event' must be one of: 'start' | 'end'
function createMeetingEvent(meeting_id, event, timestamp) {
    app.service('meeting_events').create(
        {
            meeting: meeting_id,
            event: event,
            timestamp: timestamp
        },
        {},
        function (error, data) {
            if (error) {
            } else {
                winston.log('info', "Added meeting start event");
            }
        }
    );
}


// create a participant event
// participant_ids must be a list of google person IDs.
function createParticipantEvent(participant_ids, meeting, timestamp) {
    app.service('participant_events').create(
        {
            participants: participant_ids,
            meeting: meeting,
            timestamp: timestamp
        }, function(error, data) {
            if (error) {
            } else {
                winston.log("info", "created new participant event for meeting", meeting);
            }
        });
}


// adds a given user (participant_id) to the database.
// users are considered uniqe by 'participant_id' and 'meeting_id' -
// we may have the same participant_id twice, by different meetings.
// if the user already is recorded for that meeting, do nothing.
function add_user(participant_id, meeting_id, image_url, name, locale) {
    winston.log("info", "add user:", participant_id, name);
    app.service('participants').find(
        {
            query: {
                $and: [{participant_id: participant_id},
                       {meeting: meeting_id}]
            }
        },
        // {
        //     $and: [{'participant_id': participant_id},
        //            { 'hangout_id': hangout_id}]
        // },
        function(error, data) {
            if (error) {
                console.log("COULDNT ADD USER");
                return;
            }
            // // we have to get all the matching records for this
            // // participant because I can't figure out how to get
            // // '$and' working correctly w/ mongo....
            // var matching_records = _.filter(data, function(participant) {
            //     return participant.participant_id == participant_id &&
            //         participant.hangout_id == hangout_id;
            // });

            if (data.length > 0) {
                winston.log("info", "already have participant by id:", participant_id);
                return;
            } else { // we don't, add it.
                winston.log("info", "creating new participant:", participant_id, name);
                app.service('participants').create(
                    {
                        '_id': participant_id,
                        'meeting': meeting_id,
                        'name': name,
                        'locale': locale
                    }, {}, function(error, data) {

                    });
            }
        });
}


// Gets called on meeting::participantsChanged
// updates the participant list for the given hangout ID.
//
function updateMeetingParticipants(meeting, new_participants) {
    winston.log("info", "updating meeting participants:", meeting, new_participants);
    app.service('meetings').find(
        {
            query: {
                meeting: meeting,
                $limit: 1
            }
        },
        function(error, foundMeetings) {
            if (error) {
            } else {
                var foundMeeting = foundMeetings[0];

                var new_participant_ids = _.map(new_participants, function(p) {
                    return p.participant_id;
                });

                // log the participant changed event
                createParticipantEvent(new_participant_ids, meeting, new Date());

                // add any new participants to the database
                _.each(new_participants, function(p) {
                    winston.log("info", "new participants:", p);
                    add_user(p.participant_id, p.meeting, p.image_url, p.name, p.locale);
                });

                // patch this meeting to have the most recent participant list
                // if it has 0 participants, mark it inactive, and save the end time.
                // if it has > 0 participants, mark it active and set end time to null.
                var active = (new_participant_ids.length > 0);
                var end_time = null;
                if (!active) {
                    end_time = new Date();
                    talk_time.stop(meeting);
                    turns.stop(meeting);
                } else if (!foundMeeting.active && active) {
                    // if meeting is moving from inactive to active...
                    winston.log("info", "starting computing talk times...");
                    talk_time.compute(meeting._id);
                    turns.compute(meeting._id);
                }
                app.service('meetings').patch(
                    meeting._id,
                    {
                        participants: new_participant_ids,
                        active: active,
                        end_time: end_time
                    },
                    {},
                    function(error, data) {
                        if (error) {
                            winston.log('error', 'Could not update participant list for meeting' + data._id);
                        } else {
                            winston.log('debug', 'Updated participant list for meeting' + data._id + 'to' + data.participants);
                        }
                    }
                );
            }
        });
};


module.exports = {
    add_user: add_user,
    updateMeetingParticipants: updateMeetingParticipants,
    createParticipantEvent: createParticipantEvent,
    createMeetingEvent: createMeetingEvent,
    createMeeting: createMeeting
};
