var winston = require('winston');
var _ = require('underscore');
var app = require('./app');


function date_diff(d1, d2) {
    return Math.abs(new Date(d1).getTime() - new Date(d2).getTime());
}


// Hooks:
// 
// create: Checks to see if there are any times in the recorded
// speaking times for this hangout / participant combo that end or
// start within 1s of the reported time. If there are, it doesn't
// insert the event.
// TODO: This should query the database for talk times that are after, say,
// 5s before the given start time, to reduce computational load.
function configure_talking_history_hooks() {
    var talkingHistoryService = app.service('talking_history');

    // check for repeat data in DB before creating.
    talkingHistoryService.before({
        create(hook, next) {
            app.service('talking_history').find(
                {
                    query: {
                        hangout_id: hook.data.hangout_id,
                        participant_id: hook.data.participant_id
                    }
                },
                function(error, foundhistory) {
                    if (error) {
                        winston.log('error', 'Couldnt access the talking history service...');
                    } else {
                        var time_match_threshold = 2 * 1000; // threshold for times being "matched", in ms
                        // there are some talk events from this participant
                        // filter them, find if any are very close:
                        var matches = _.filter(foundhistory,
                                               function(history_obj) {
                                                   var start_diff = date_diff(history_obj.start_time,
                                                                              hook.data.start_time);
                                                   var end_diff = date_diff(history_obj.end_time,
                                                                            hook.data.end_time);
                                                   return (start_diff < time_match_threshold
                                                           || end_diff < time_match_threshold);
                                               });
                        if (matches.length == 0) {
                            winston.log("info", "Inserting new talking history data, not a repeat...");
                            winston.log("info", hook.data);
                            next();
                        } else {
                            winston.log("info", "Tried to insert repeat talking history data! Nuh-Uh");
                        }
                    }
                }
            );
            
        }
    });
}

function configure_hooks() {
    winston.log("info", "Configuring hooks for feathers services");
    configure_talking_history_hooks();
}

module.exports =  {
    configure_hooks: configure_hooks
};
