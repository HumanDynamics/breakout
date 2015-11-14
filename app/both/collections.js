// All the meteor collections!

// Each item in Hangouts is of the form:
// 'participants': [user_id1, user_id2, ...]
// 'start_time':   timestamp of start of hangout
// 'end_time':     timestamp of end of hangout, or null
// 'url':          URL of hangout
// 'hangout_id':   ID of hangout
// 'active':       boolean whether hangout is currently active
Hangouts = new Mongo.Collection("hangouts");


// Speaking history item for a particular hangout.
// of the form:
// 'participant_id': meteor participant ID
// 'hangout_id':     meteor hangout ID of talk event
// 'start_time':     timestamp of beginning of talking period
// 'end_time':       tiemstamp of end of talking period
//? 'volumes':        raw volume data of this talk event from the google hangout
TalkingHistory = new Mongo.Collection("talking_history");


// TODO: refactor to 'Participants'
// Participants in hangouts
// 'talker':      Name of talker
// 'image':       Google profile image url
// 'hangout_id':  Meteor hangout id for this participant
// 'hangout_url': the URL for the hangout this participant is in.
// 'gid':         Google ID for this participant.
Talkers = new Mongo.Collection("talkers");
Talkers._ensureIndex({gid: 1, hangout_id: 1}, {unique: true});


// Volume changed events for hangouts
// of the form:
// 'timestamp':   timestamp of this event
// 'participant': participant ID for the event
// 'hangout_id':  meteor hangout ID of the event
// 'volume':      volume of the volumechanged event.
Volumes = new Mongo.Collection("volume_events");


// Followers for a particular hangout.
// of the form:
// TODO
Followers = new Mongo.Collection("followers");

// Herfindahl index records for hangouts
// of the form:
// 'timestamp':     timestamp of this event
// 'hangout_id':    meteor ID of the event
// 'h_index':       herfindahl index at this timestamp
// 'second_window': the length of the window being examined. if 'all', is the entire hangout up to that point.
HIndices = new Mongo.Collection('h_indices');
