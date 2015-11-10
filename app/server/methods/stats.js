
// start and end in date, same with talkingRecord.start_time and
// talkingRecord.end_time
// just returns the number of seconds overlap.
function getSecondsInWindow(talkingRecord, start, end) {
    talkingRecord.end_time = new Date(talkingRecord.end_time);
    talkingRecord.start_time = new Date(talkingRecord.start_time);
    var ms;
    var base_duration = talkingRecord.end_time.getTime() - talkingRecord.start_time.getTime();
    if (talkingRecord.start_time >= start && talkingRecord.end_time <= end) {
        ms = base_duration;
    } else if (talkingRecord.start_time < start && talkingRecord.end_time <= end) {
        var sub = start.getTime() - talkingRecord.start_time.getTime();
        ms = base_duration - sub;
    } else if (talkingRecord.start_time >= start && talkingRecord.end_time > end) {
        var sub = talkingRecord.end_time.getTime() - end.getTime();
        ms = base_duration - sub;
    } else if (talkingRecord.start_time < start && talkingRecord.end_time > end) {
        var sub1 = start.getTime() - talkingRecord.start_time.getTime();
        var sub2 = talkingRecord.end_time.getTime() - end.getTime();
        ms = base_duration - sub1 - sub2;
    }
    return ms / 1000;
}

Meteor.methods({

    'secondsSpokenByParticipants': function getSecondsSpoken(meteorHangoutId, secondWindow) {
        var now = new Date();
        var secondsAgo = new Date(now.getTime() - (secondWindow * 1000));
        var records = TalkingHistory.find({'hangout_id': meteorHangoutId,
                                           'end_time': {'$gt': secondsAgo.getTime()}}).fetch();

        console.log("records: ", records, "for hangout id: ", meteorHangoutId, "greater than time: ", secondsAgo);
        //  of'participantid: <list of talking records>'
        participantRecords = _.groupBy(records, 'participant_id');

        var secondsSpoken = {};
        for (participantId in participantRecords) {
            var talkingRecords = participantRecords[participantId];
            var speakingLengths = _.map(talkingRecords, function(record) {
                return getSecondsInWindow(record, now, secondsAgo);
            });

            secondsSpoken[participantId] = _.reduce(speakingLengths, function(memo, num) {
                return memo + num;
            }, 0);
        }
        
        // var secondsSpoken = _.mapObject(participantRecords, function(talkingRecords, participantId) {
        //     var speakingLengths = _.map(talkingRecords, function(record) {
        //         return getSecondsInWindow(record, now, secondsAgo);
        //     });

        //     return _.reduce(speakingLengths, function(memo, num) {
        //         return memo + num;
        //     }, 0);
        // });
        
        return secondsSpoken;
    },

    
    // returns the hierfendahl index for the given hangout from the
    // seconds window given
    'getHerfindahl': function getHerfindahl(meteorHangoutId, secondWindow) {
        var secondsSpoken = Meteor.call('secondsSpokenByParticipants', meteorHangoutId, secondWindow);
        var seconds = _.values(secondsSpoken);
        var totalSeconds = _.reduce(secondsSpoken, function(memo, num) {
            return memo + num; 
        }, 0);
        
        var fractions = _.map(seconds, function(secondsSpoken) {
            return secondsSpoken / totalSeconds;
        });
        
        var h_index =  _.reduce(fractions, function(memo, num) {
            return memo + (num * num);
        }, 0);

        return h_index
            
    },


    'computeHerfindahl': function(meteorHangoutId, secondWindow) {
        var h_index = Meteor.call('getHerfindahl', meteorHangoutId, secondWindow);
        HIndices.insert({'hangout_id': meteorHangoutId,
                         'timestamp': Date.now(),
                         'h_index': h_index,
                         'second_window': secondWindow});
    },
        
});

// how often (seconds) to compute herfindahl index
var herfindahlFrequency = 10;

Meteor.setInterval(function() {
    console.log("computing herfindahl indices..");
    var activeHangouts = Hangouts.find({'active': true});
    
    if (activeHangouts.count() == 0) {
        console.log("no active hangouts...");
        return;
    }

    activeHangouts = activeHangouts.fetch();
    _.each(activeHangouts, function(hangout, index, list) {
        console.log("computing herfindahl for hangout: ", hangout);
        Meteor.call('computeHerfindahl', hangout._id, herfindahlFrequency);
    });
}, herfindahlFrequency * 1000);
