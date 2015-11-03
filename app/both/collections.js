// All the meteor collections!

// Each item in Hangouts is of the form:
// 'participants': [user_id1, user_id2, ...]
// 'start_time':   timestamp of start of hangout
// 'end_time':     timestamp of end of hangout, or null
// 'url':          URL of hangout
// 'hangout_id':   ID of hangout
// 'active':       boolean whether hangout is currently active
Hangouts = new Mongo.Collection("hangouts");


// Participants in hangouts
// of the form:
// 'name':  display name of this participant
// 'image': image URL for participant
// 'gid':   google ID of participant
Participants = new Mongo.Collection("participants");


// Speaking history item for a particular hangout.
// of the form:
// 'participant_id': meteor participant ID
// 'hangout_id':     meteor hangout ID of talk event
// 'start_time':     timestamp of beginning of talking period
// 'end_time':       tiemstamp of end of talking period
//? 'volumes':        raw volume data of this talk event from the google hangout
TalkingHistory = new Mongo.Collection("talking_history");


// Snapshot of all users that are talking at a given point in time
// of the form:
// 'talkers':   [participant_id1, participant_id2, ...]
// 'timestamp': timestamp of time of record
Talkers = new Mongo.Collection("talkers");


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


