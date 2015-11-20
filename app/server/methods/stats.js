// start and end in date, same with talkingRecord.start_time and
// talkingRecord.end_time
// just returns the number of seconds overlap between end and start in
// talkingRecord.
function getSecondsInWindow(talkingRecord, end, start) {
    talkingRecord.end_time = new Date(talkingRecord.end_time);
    talkingRecord.start_time = new Date(talkingRecord.start_time);
//    console.log("> computing second window, talkingrecord:", talkingRecord);
    console.log("window:", start, end);
    var ms;
    var base_duration = talkingRecord.end_time.getTime() - talkingRecord.start_time.getTime();
    console.log("base duration", base_duration);
    if (talkingRecord.start_time >= start && talkingRecord.end_time <= end) {
        ms = base_duration;
    } else if (talkingRecord.start_time <= start && talkingRecord.end_time <= end) {
        var sub = start.getTime() - talkingRecord.start_time.getTime();
        ms = base_duration - sub;
    } else if (talkingRecord.start_time >= start && talkingRecord.end_time >= end) {
        var sub = talkingRecord.end_time.getTime() - end.getTime();
        ms = base_duration - sub;
    } else if (talkingRecord.start_time <= start && talkingRecord.end_time >= end) {
        var sub1 = start.getTime() - talkingRecord.start_time.getTime();
        var sub2 = talkingRecord.end_time.getTime() - end.getTime();
        ms = base_duration - sub1 - sub2;
    } else {
        // we should never be here, right?
        console.log("impossible talk event, vomiting everywhere");
        return 0;
    }
    // if it's less than 0, it means there's no overlap at all.
    if (ms < 0) {
        return 0;
    }
    console.log("seconds:", ms / 1000);
    return ms / 1000;
}

function getSecondsSpoken(meteorHangoutId, secondWindow) {
    var now = new Date();
    var secondsAgo = new Date(now.getTime() - (secondWindow * 1000)).toISOString();
    now = now.toISOString();
    console.log("> seconds ago: ", secondsAgo);
    console.log("> now: ", now);
    console.log("> meteor hangout id: ", meteorHangoutId);
    var records = TalkingHistory.find({'hangout_id': meteorHangoutId,
                                       '$or': [{'end_time': {'$gt': secondsAgo}},
                                               {'start_time': {'$lt': now}}]}).fetch();
                                       // 'end_time': {'$gte': new Date(secondsAgo),
                                       //              '$lt': new Date(now)}}).fetch();

    //  of'participantid: <list of talking records>'
    participantRecords = _.groupBy(records, 'participant_id');

    var secondsSpoken = {};
    for (participantId in participantRecords) {
        var talkingRecords = participantRecords[participantId];
        //console.log("talkingRecords", talkingRecords);
        var speakingLengths = _.map(talkingRecords, function(record) {
            return getSecondsInWindow(record, now, new Date(secondsAgo));
        });

        console.log("speakingLenghts:", speakingLengths);
        secondsSpoken[participantId] = _.reduce(speakingLengths, function(memo, num) {
            return memo + num;
        }, 0);
    }
    console.log(">> seconds spoken:", secondsSpoken);

    // var secondsSpoken = _.mapObject(participantRecords, function(talkingRecords, participantId) {
    //     var speakingLengths = _.map(talkingRecords, function(record) {
    //         return getSecondsInWindow(record, now, secondsAgo);
    //     });

    //     return _.reduce(speakingLengths, function(memo, num) {
    //         return memo + num;
    //     }, 0);
    // });

    return secondsSpoken;
}

// returns the hierfendahl index for the given hangout from the
// seconds window given
function getHerfindahl(meteorHangoutId, secondWindow) {
    var secondsSpoken = getSecondsSpoken(meteorHangoutId, secondWindow);
    var seconds = _.values(secondsSpoken);
    console.log("secondsSpoken:", secondsSpoken);

    var totalSeconds = _.reduce(secondsSpoken, function(memo, num) {
        return memo + num;
    }, 0);
    console.log("> total s talking: ", totalSeconds);

    if (totalSeconds == 0) {
      return null;
    }

    var fractions = _.map(seconds, function(secondsSpoken) {
        return secondsSpoken / totalSeconds;
    });
    console.log("> fractions: ", fractions);

    var h_index =  _.reduce(fractions, function(memo, num) {
        return memo + (num * num);
    }, 0);
    console.log("> computed index: ", h_index);

    return h_index;
}


Meteor.methods({
    // TODO: for now, this will be called by the client in a setInterval.
    // (because if we insert on the server, it doesn't update...)
    'computeHerfindahl': function(meteorHangoutId, secondWindow) {
        console.log("computing herfindahl index...");
        var h_index = getHerfindahl(meteorHangoutId, secondWindow);
        // if it's garbage (like if nobody's been talking), return the last one
        // computed.
        if (!h_index) {
          var lastIndex = HIndices.findOne({'hangout_id': meteorHangoutId},
                                           {'sort': {'timestamp': -1, 'limit': 1}});
          // if that one's garbage, just return 1.
          if (!lastIndex) {
            h_index = 1;
          } else {
            h_index = lastIndex.h_index;
            console.log("using last computed index:", h_index);
          }
        }
        console.log("h_index reported as:", h_index);
        HIndices.insert({'hangout_id': meteorHangoutId,
                         'timestamp': (new Date()).toISOString(),
                         'h_index': h_index,
                         'second_window': secondWindow});
        return h_index;
    },

    'getHerfindahl': function(meteorHangoutId, secondWindow) {
      console.log("getting herfindahl...");
      var res =  HIndices.findOne({'hangout_id': meteorHangoutId},
                                  {'sort': {'timestamp': -1, 'limit': 1}});
      console.log("returning hindex object:", res);
      return res;
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
        console.log("computing herfindahl for hangout: ", hangout._id);
        Meteor.call('computeHerfindahl', hangout._id, herfindahlFrequency);
    });
}, herfindahlFrequency * 1000);
