Meteor.methods({
  // returns an object the reports the total time spoken across all
  // participants of the given hangout.
  // of the form:
  // {'<participantId>: <total ms>, ...}
  'getTotalTimeSpoken': function(meteorHangoutId, secondWindow) {
    var now = new Date();
    var secondsAgo = new Date(now.getTime() - (secondWindow * 1000))
    now = now.toISOString();
    var records = TalkingHistory.find({
      'hangout_id': meteorHangoutId,
      'duplicate': false,
    }).fetch();

    var participantRecords = _.groupBy(records, 'participant_id');

    for (participantId in participantRecords) {
      var talkingRecords = participantRecords[participantId];
      // list of speaking lengths, in seconds, for each participant.
      var speakingLengths = _.map(talkingRecords, function(record) {
        var msDiff = (new Date(record.end_time)).getTime() - (new Date(record.start_time)).getTime();
        return msDiff / 1000;
      });

      // sum
      participantRecords[participantId] = _.reduce(speakingLengths, function(totalSeconds, seconds) {
        return totalSeconds + seconds;
      }, 0);
    };


    // [{participantId: <id>, secondsSpoken: <seconds spoken>}, ...]
    return _.map(_.pairs(participantRecords), function(pair) {

      var speakingObject = {
        'participantId': pair[0],
        'secondsSpoken': pair[1]
      };
      return speakingObject;
    });
  },
});
