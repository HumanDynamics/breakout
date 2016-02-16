var winston = require('winston');
var _ = require('underscore');
var app = require('../app');


function save_turns(hangout_id, turns, from, to) {
    if (_.isEmpty(turns)) {
        winston.log("info", "not saving empty turn object");
    } else {
        app.service('turns').create(
            {
                hangout_id: hangout_id,
                turns: turns,
                timestamp: new Date(),
                from: from.toISOString(),
                to: to.toISOString()
            },
            {},
            function(error, data) {
                if (error) {
                    winston.log("info", "couldnt store turn data for hangout:", hangout_id, error);
                } else {
                    winston.log("info", "stored turns for hangout:", hangout_id);
                }
            }
        );
    }
}

// returns an object that reports the total time spoken by
// the given participant ids in the given hangout.
// of the form:
// {<participantId>: <total ms>, ...}
// if participant_ids is false, matches on all participants.
function get_turns(hangout_id, from, to) {
    winston.log("info", "getting turn data for hangout", hangout_id);

    app.service('talking_history').find(
        { query:
          {
              hangout_id: hangout_id,
              start_time: {$gt: from.toISOString(),
                           $lt: to.toISOString()}
          }
        },
        function(error, data) {
            if (error) {
                console.log("couldnt get talkinghistory for hangout", error);
            } else  {
                // TODO:may want to filter for participants still
                // actively in the hangout here
                var participant_records = _.groupBy(data, 'participant_id');
                var num_utterances = _.mapObject(participant_records, function(val, key) {
                    return val.length;
                });

                var total_utterances = _.reduce(_.pairs(num_utterances), function(memo, val) {
                    return memo + val[1];
                }, 0);

                num_utterances = _.mapObject(num_utterances, function(val, key) {
                    return val / total_utterances;
                });

                save_turns(hangout_id, num_utterances, from, to);
            }
        }
    );
}

var turn_ids = {};
var turns_compute_interval = 5 * 1000;

var start_computing_turns = function(hangout_id) {
    winston.log("info", "starting computing turns for hangout:", hangout_id, turn_ids);
    
    // if it's being run, don't start another one...
    if (_.has(turn_ids, hangout_id)) {
        winston.log("info", "already computing turns for hangout", hangout_id);
        return;
    }
    
    var pid = setInterval(function() {
        get_turns(hangout_id, new Date(Date.now() - 5 * 60 * 1000), new Date());
    }, turns_compute_interval);
    
    turn_ids[hangout_id] = pid;
};

var stop_computing_turns = function(hangout_id) {
    if (_.has(turn_ids, hangout_id)) {
        winston.log("info", "stopping computing turns for hangout:", hangout_id);
        var pid = turn_ids[hangout_id];
        clearInterval(pid);
        delete turn_ids[hangout_id];
    }
};


module.exports =
    {
        compute: start_computing_turns,
        stop: stop_computing_turns,
        processes: turn_ids
    };
