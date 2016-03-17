var winston = require('winston');
var _ = require('underscore');
var app = require('./app');
var crypto = require('./crypto');



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
    var talkingHistoryService = app.service('/talking_history');

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


function json_transform(obj, id, transform) {
    return JSON.parse(JSON.stringify(obj, function(key, value) {
        if (value !== null && key === id) {
            return transform(value);
        } else if (typeof value === 'object' && value !== null && value.id === id) {
            // case where it's an item in a list of objects
            return value
        } else {
            return value;
        }
    }));
}


function configure_hangouts_hooks() {
    var hangoutService = app.service('hangouts');

    // check for repeat data in DB before creating.
    hangoutService.before({
        create(hook, next) {
            hook.data = json_transform(hook.data, 'participants', function(ps){return _.map(ps, crypto.encrypt)});
            hook.data.start_time = new Date();
            //hook.data.participants = _.map(hook.data.participants, crypto.encrypt);
            next();
        },

        find(hook, next) {
            hook.params = json_transform(hook.params, 'participants', function(ps){return _.map(ps, crypto.encrypt)});
            next();
        },
        
        patch(hook, next) {
            hook.data = json_transform(hook.data, 'participants', function(ps){return _.map(ps, crypto.encrypt)});
            hook.data.last_updated = new Date();
            next();
        },

        update(hook, next) {
            hook.data = json_transform(hook.data, 'participants', function(ps){return _.map(ps, crypto.encrypt)});
            hook.data.last_updated = new Date();
            next();
        }
    });

    hangoutService.after({
        create(hook, next) {
            hook.result = json_transform(hook.result, 'participants', function(ps){return _.map(ps, crypto.decrypt)});
            next();
        },

        find(hook, next) {
            if (hook.result) {
                console.log("hangouts result BEFORE", hook.result);
                hook.result = json_transform(hook.result, 'participants', function(ps){return _.map(ps, crypto.decrypt)});
                console.log("hangouts result AFTER", hook.result);
            }
            next();
        },
        
        patch(hook, next) {
            hook.result = json_transform(hook.result, 'participants', function(ps){return _.map(ps, crypto.decrypt)});
            next();
        },

        update(hook, next) {
            hook.result = json_transform(hook.result, 'participants', function(ps){return _.map(ps, crypto.decrypt)});
            next();
        }
    });
}


function configure_participant_hooks() {
    var service = app.service('participants');

    // check for repeat data in DB before creating.
    service.before({
        create(hook, next) {
            hook.data = json_transform(hook.data, 'participant_id', crypto.encrypt);
            next();  
        },

        find(hook, next) {
            hook.params = json_transform(hook.params, 'participant_id', crypto.encrypt);
            next();
        },
        
        patch(hook, next) {
            hook.data = json_transform(hook.data, 'participant_id', crypto.encrypt);
            next();
        },

        update(hook, next) {
            hook.data = json_transform(hook.data, 'participant_id', crypto.encrypt);
            next();
        }
    });

    service.after({
        create(hook, next) {
            hook.result = json_transform(hook.result, 'participant_id', crypto.decrypt);
            next();
        },

        find(hook, next) {
            //winston.log("info", "participant find result(1):", hook.result[0);
            if (hook.result.length > 0) {
                hook.result = _.map(hook.result, function(obj) {
                    return json_transform(obj, 'participant_id', crypto.decrypt);
                });
            }
            next();
        },
        
        patch(hook, next) {
            hook.result = json_transform(hook.result, 'participant_id', crypto.decrypt);
            next();
        },

        update(hook, next) {
            hook.result = json_transform(hook.result, 'participant_id', crypto.decrypt);
            next();
        }
    });
}


function configure_turn_hooks() {
    var service = app.service('turns');

    // check for repeat data in DB before creating.
    service.before({
        create(hook, next) {
            hook.data = json_transform(hook.data, 'participant_id', crypto.encrypt);
            console.log("TURN", hook.data);
            next();  
        },

        find(hook, next) {
            hook.params = json_transform(hook.params, 'participant_id', crypto.encrypt);
            next();
        },
        
        patch(hook, next) {
            hook.data = json_transform(hook.data, 'participant_id', crypto.encrypt);
            next();
        },

        update(hook, next) {
            hook.data = json_transform(hook.data, 'participant_id', crypto.encrypt);
            next();
        }
    });

    service.after({
        create(hook, next) {
            hook.result = json_transform(hook.result, 'participant_id', crypto.decrypt);
            next();
        },

        created(hook, next) {
            winston.log("info", ">>>>>>>CREATED OMG");
            hook.result = json_transform(hook.result, 'participant_id', crypto.decrypt);
            next();
        },

        find(hook, next) {
            //winston.log("info", "participant find result(1):", hook.result[0);
            if (hook.result.length > 0) {
                hook.result = _.map(hook.result, function(obj) {
                    return json_transform(obj, 'participant_id', crypto.decrypt);
                });
            }
            next();
        },
        
        patch(hook, next) {
            hook.result = json_transform(hook.result, 'participant_id', crypto.decrypt);
            next();
        },

        update(hook, next) {
            hook.result = json_transform(hook.result, 'participant_id', crypto.decrypt);
            next();
        }
    });
}

function configure_hooks() {
    winston.log("info", "Configuring hooks for feathers services");
    configure_talking_history_hooks();
    configure_hangouts_hooks();
    configure_participant_hooks();
    configure_turn_hooks();
}

module.exports =  {
    configure_hooks: configure_hooks
};
