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
// speaking times for this meeting / participant combo that end or
// start within 1s of the reported time. If there are, it doesn't
// insert the event.
// TODO: This should query the database for talk times that are after, say,
// 5s before the given start time, to reduce computational load.

function remove_talking_history_repeats(hook, next) {
    app.service('utterances').find(
        {
            query: {meeting: hook.data.meeting_id,
                    participant: hook.data.participant_id}
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

function encrypt_hook(keys) {
    var encrypt_hook = function(hook, next) {
        winston.log("debug", ">>>ENCRYPTING:", hook.data);
        function encrypt_ids(data) {
            return json_transform(data, keys, crypto.encrypt);
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
    return encrypt_hook;
}

function decrypt_hook(keys) {
    var decrypt_hook = function(hook, next) {
        winston.log("debug", ">>>DECRYPTING:", hook.result);
        function decrypt_ids(data) {
            return json_transform(data,
                                  keys,
                                  crypto.decrypt);
        }
        if (hook.result !== null && hook.result.length > 0) {
            var decrypted = decrypt_ids(hook.result);
            winston.log("debug", "decrypted:", decrypted);
            hook.result = decrypted;
        }
        next();
    }
    return decrypt_hook;
}


// created and updated times for meetings
function configure_meetings_hooks() {
    var meetingService = app.service('meetings');

    // check for repeat data in DB before creating.
    meetingService.before({
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

function configure_encryption_hooks() {
    var participant_keys = ['participant', 'participants'];
    var participant_encrypt = encrypt_hook(participant_keys);
    var participant_decrypt = decrypt_hook(participant_keys);

    var participant_info_keys = ['name', 'image_url'];
    var participant_info_encrypt = encrypt_hook(participant_info_keys);
    var participant_info_decrypt = decrypt_hook(participant_info_keys);

    app.service('meetings').before(participant_encrypt).after(participant_decrypt);
    app.service('utterances').before(participant_encrypt).after(participant_decrypt);
    app.service('participant_events').before(participant_encrypt).after(participant_decrypt);
    app.service('participants')
    .before([encrypt_hook('_id'), participant_info_encrypt])
    .after([decrypt_hook('_id'), participant_info_decrypt]);

    app.service('meeting_events').before(participant_encrypt).after(participant_decrypt);

    app.service('utterance_distributions').before({
        all: participant_encrypt,
        create: remove_talking_history_repeats
    }).after(participant_decrypt);
}

function configure_hooks() {
    winston.log("info", "Configuring hooks for feathers services");
    configure_encryption_hooks();
    configure_meetings_hooks();
}

module.exports =  {
    configure_hooks: configure_hooks
};
