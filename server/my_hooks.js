var winston = require('winston');
var _ = require('underscore');
var app = require('./app');
var crypto = require('./crypto');
var json_transform = require('./json_utils').json_transform;



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

function remove_talking_history_repeats(hook, next) {
    var talkingHistoryService = app.service('/talking_history');
    app.service('talking_history').find(
        {
            query: {hangout_id: hook.data.hangout_id,
                    participant_id: hook.data.participant_id}
        },
        function(error, foundhistory) {
            if (error) {
                winston.log('error', 'Couldnt access the talking history service...', error);
                next();
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
                    next();
                }
            }
        }
    );
}

function encrypt_participant_ids(hook, next) {
    winston.log("debug", ">>>ENCRYPTING:", hook.data);
    function encrypt_ids(data) {
        return json_transform(data,
                              ['participant_id', 'participants'],
                              crypto.encrypt);
    }
    
    if (hook.data != null) {
        /* winston.log("debug", "encrypting data:", hook.data); */
        var encrypted_data = encrypt_ids(hook.data);
        /* winston.log("debug", "encrypted data:", encrypted_data); */
        hook.data = encrypted_data;
    }

    if (hook.params != null) {
        /* winston.log("debug", "encrypting params:", hook.params); */
        var encrypted_params = encrypt_ids(hook.params);
        /* winston.log("debug", "encrypted params:", encrypted_params); */
        hook.params = encrypted_params;
    }
    next();
}


function decrypt_participant_ids(hook, next) {
    winston.log("debug", ">>>DECRYPTING:", hook.result);
    function decrypt_ids(data) {
        return json_transform(data,
                              ['participant_id', 'participants'],
                              crypto.decrypt);
    }
    if (hook.result !== null && hook.result.length > 0) {
        var decrypted = decrypt_ids(hook.result);
        winston.log("debug", "decrypted:", decrypted);
        hook.result = decrypted;
    }
    next();
}


// created and updated times for hangouts
function configure_hangouts_hooks() {
    var hangoutService = app.service('hangouts');

    // check for repeat data in DB before creating.
    hangoutService.before({
        create(hook, next) {
            hook.data.start_time = new Date();
            next();
        },

        patch(hook, next) {
            hook.data.last_updated = new Date();
            next();
        },

        update(hook, next) {
            hook.data.last_updated = new Date();
            next();
        }
    });
}

function configure_hooks() {
    winston.log("info", "Configuring hooks for feathers services");
    app.service('hangouts').before(encrypt_participant_ids).after(decrypt_participant_ids);
    app.service('turns').before(encrypt_participant_ids).after(decrypt_participant_ids);
    app.service('participant_events').before(encrypt_participant_ids).after(decrypt_participant_ids);
    app.service('participants').before(encrypt_participant_ids).after(decrypt_participant_ids);
    app.service('hangout_events').before(encrypt_participant_ids).after(decrypt_participant_ids);
    
    app.service('talking_history').before({
        all: encrypt_participant_ids,
        create: remove_talking_history_repeats
    }).after(decrypt_participant_ids);
    
    configure_hangouts_hooks();
}

module.exports =  {
    configure_hooks: configure_hooks
};
