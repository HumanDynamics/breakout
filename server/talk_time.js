var winston = require('winston');
var _ = require('underscore');
var app = require('./app');


function save_talk_times(meeting, talk_times) {
    // if there's no data to save, don't save anything.
    if (talk_times.length == 0) {
        winston.log("info", "not storing empty talk times:", talk_times);
        return;
    }

    app.service('utterances').create(
        {
            meeting: meeting,
            talk_times: talk_times,
            timestamp: new Date()
        },
        {},
        function(error, data) {
            if (error) {
            } else {
                winston.log("info", "stored speaking times for meeting:", meeting);
            }
        }
    );
}

// returns an object that reports the total time spoken by
// the given participant ids in the given hangout.
// of the form:
// {<participantId>: <total ms>, ...}
// if participant_ids is false, matches on all participants.
//
// TODO: currently gets all items from mongo, and filters, because
// using $and hasn't been working for some reason. Would be more efficient
// if $and worked for db lookups.
//
// if `store` is true, store the result in the talktime db.
function get_time_spoken(participant_ids, meeting, from, to, store) {
    winston.log("info", 'getting talk events from:', from.toISOString(), from);
    app.service('utterance_distributions').find(
        { query:
            { $and:
                [
                    {meeting: meeting},
                    {start_time: {$gt: from.toISOString()}}
                ]
            }
        },
        function(error, data) {
            if (error) {
                return {};
            }
            //
            // // returns true if tofind is in array
            // var isin = function(array, tofind) {
            //     return _.some(array, function(item) {
            //         return item == tofind;
            //     });
            // };
            //
            // var matching_records = [];
            // // if participant_ids is false, use all participants
            // if (participant_ids) {
            // // all records matching participant id info
            //     matching_records = _.filter(data, function(talk_time_obj) {
            //         return isin(participant_ids, talk_time_obj.participant_id) &&
            //             talk_time_obj.hangout_id == hangout_id;
            //     });
            // } else {
            //     matching_records = data;
            // }

            var participant_records = _.groupBy(data, 'participant');

            var talk_time_records = {};

            for (var talker_id in participant_records) {
                var talking_records = participant_records[talker_id];

                var speaking_lengths = _.map(talking_records, function(record) {
                    var msDiff = (new Date(record.end_time)).getTime() - (new Date(record.start_time)).getTime();
                    return msDiff / 1000;
                });

                // sum
                talk_time_records[talker_id] = _.reduce(speaking_lengths, function(total_seconds, seconds) {
                    return total_seconds + seconds;
                }, 0);
            }

            var res =  _.map(_.pairs(talk_time_records), function(pair) {
                var speakingObj =
                    {
                        participant: pair[0],
                        seconds: pair[1]
                    };
                return speakingObj;
            });

            if (store) {
                save_talk_times(meeting, res);
            }
            return res;

        });
}

var get_time_spoken_since = function(from_time, participants, meeting) {
    return get_time_spoken(participants,
                           meeting,
                           from_time,
                           new Date());
};

var get_time_spoken_in_meeting = function(meeting) {
    return get_time_spoken(null,
                           meeting,
                           new Date(-8640000000000000), // earliest time
                           new Date(),
                           true);
};


var talk_time_ids = {};
var talk_time_compute_interval = 5 * 1000;

var start_computing_talk_times = function(meeting) {
    winston.log("info", "starting computing talk times for meeting:", meeting);

    // if it's being run, don't start another one...
    if (_.has(talk_time_ids, meeting)) {
        winston.log("info", "already computing talk times for hangout", meeting);
        return;
    }

    var pid = setInterval(function() {
        get_time_spoken_in_meeting(meeting);
    }, talk_time_compute_interval);

    talk_time_ids[meeting] = pid;
};

var stop_computing_talk_times = function(meeting) {
    if (_.has(talk_time_ids, meeting)) {
        winston.log("info", "stopping computing talk times for meeting:", meeting);
        var pid = talk_time_ids[meeting];
        clearInterval(pid);
        delete talk_time_ids[meeting];
    }
};


module.exports =
    {
        time_spoken_since: get_time_spoken_since,
        total_time_spoken_in_hangout: get_time_spoken_in_meeting,
        compute: start_computing_talk_times,
        stop: stop_computing_talk_times,
        processes: talk_time_ids
    };
