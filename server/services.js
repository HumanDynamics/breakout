var mongodb = require('feathers-mongodb');

module.exports = {
    // Each item in Hangouts is of the form:
    // 'participants': [user_id1, user_id2, ...]
    // 'start_time':   timestamp of start of hangout
    // 'end_time':     timestamp of end of hangout, or null
    // 'url':          URL of hangout
    // 'hangout_id':   ID of hangout
    // 'active':       boolean whether hangout is currently active
    hangoutService: mongodb({
        collection: 'hangouts'
    }),

    // Speaking history item for a particular hangout.
    // of the form:
    // 'participant_id': meteor participant ID
    // 'hangout_id':     meteor hangout ID of talk event
    // 'start_time':     timestamp of beginning of talking period
    // 'end_time':       tiemstamp of end of talking period
    //? 'volumes':        raw volume data of this talk event from the google hangout
    talkingHistoryService: mongodb({
        collection: 'talking_history'
    }),

    // Participants in hangouts
    // 'name':      Name of talker
    // 'image':       Google profile image url
    // 'hangout_id':  Meteor hangout id for this participant
    // 'hangout_url': the URL for the hangout this participant is in.
    // 'gid':         Google ID for this participant.
    participantService: mongodb({
        collection: 'participants'
    }),

    // Volume changed events for hangouts
    // of the form:
    // 'timestamp':   timestamp of this event
    // 'participant': participant ID for the event
    // 'hangout_id':  meteor hangout ID of the event
    // 'volume':      volume of the volumechanged event.
    volumeService: mongodb({
        collection: 'volume_events'
    }),

    // Herfindahl index records for hangouts
    // of the form:
    // 'timestamp':     timestamp of this event
    // 'hangout_id':    meteor ID of the event
    // 'h_index':       herfindahl index at this timestamp
    // 'second_window': the length of the window being examined. if 'all', is the entire hangout up to that point.
    hIndexService: mongodb({
        collection: 'h_indices'
    })
}
