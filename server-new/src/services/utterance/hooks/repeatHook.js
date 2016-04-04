const _ = require('underscore')
const winston = require('winston')

function date_diff (d1, d2) {
  return Math.abs(new Date(d1).getTime() - new Date(d2).getTime())
}

exports.hook = function (hook) {
  hook.app.service('utterances').find(
    {
      query: {
        $and: [{meeting: hook.data.meeting_id},
               {participant: hook.data.participant_id}]
      }
    }).then((foundUtterances) => {
      var time_match_threshold = 2 * 1000 // threshold for times being "matched", in ms
      // there are some talk events from this participant
      // filter them, find if any are very close:
      var matches = _.filter(foundUtterances,
                             function (utterance) {
                               var start_diff = date_diff(utterance.start_time,
                                                          hook.data.start_time)
                               var end_diff = date_diff(utterance.end_time,
                                                        hook.data.end_time)
                               return (start_diff < time_match_threshold ||
                                       end_diff < time_match_threshold)
                             })
      if (matches.length === 0) {
        winston.log('info', 'Inserting new talking history data, not a repeat...')
        return hook
      } else {
        winston.log('info', 'Tried to insert repeat talking history data! Nuh-Uh')
        hook.data = {}
        return hook
      }
    })
}
