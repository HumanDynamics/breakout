var _ = require('underscore')
var winston = require('winston')
var setMeetingInactive = require('./helpers.js').setMeetingInactive

// wait 2 seconds to consider a hangout dead.
var waitingThreshold = 10 * 1000
var heartbeats = {}
var heartbeatListener = null
var Q = require('q')

// checks a given list of heartbeats for timeouts. If all hearbeats have
// timed out, then set the associated hangout to inactive.
var checkHeartbeats = function (hangout_id) {
  var timedOuts = _.map(heartbeats[hangout_id], checkHeartbeat)
  if (_.every(timedOuts)) {
    winston.log('info', 'trying to stop heartbeat for hangout:', hangout_id)
    setMeetingInactive(hangout_id, function (res) {
      if (res) {
        delete heartbeats[hangout_id]
      } else {
        winston.log('info', 'Unable to stop heartbeat for hangout', hangout_id)
      }
    })
  } else {
    return
  }
}

// Returns true if the given heartbeat has timed out.
var checkHeartbeat = function (heartbeat) {
  var delta = (new Date()) - heartbeat.timestamp
  return (delta > waitingThreshold)
}

// checks all hangouts / heartbeats for timeouts.
// if all heartbeats for a hangout have timed out, set it as inactive
// and remove it from the checker.
var checkAllHeartbeats = function () {
  winston.log('info', 'checking all heartbeats...')
  _.each(_.keys(heartbeats), checkHeartbeats)
}

// removes all heartbeat records that match the given hangout ID and participant
// ID in the heartbeat.
var stopHeartbeat = function (heartbeat) {
  winston.log('info', 'Stopping heartbeat for hangout:', heartbeat.hangout_id)
  heartbeat.hangout_id = _.filter(heartbeat.hangout_id, function (obj) {
    return obj.participant_id !== heartbeat.participant_id
  })
}

// Either creates a new heartbeat record, or updates an existing one with a
// revised timestamp.
// TODO: If we receive a heartbeat from a hangout that is marked as inactive,
// mark it as active.
var updateHeartbeat = function (heartbeat) {
  var hb = _.find(heartbeats[heartbeat.hangout_id], function (obj) {
    if (obj.participant_id === heartbeat.participant_id) {
      winston.log('info', 'updating heartbeat:', obj)
      obj.timestamp = new Date()
      return true
    }
  })

  if (hb === undefined) {
    // if we're here, we didn't find a matching heartbeat. make a new one.
    winston.log('info', 'now listening for a new heartbeat:', heartbeat)
    var hbObj = _.extend(heartbeat, {'timestamp': new Date()})
    if (_.has(heartbeats, heartbeat.hangout_id)) {
      heartbeats[heartbeat.hangout_id].push(hbObj)
    } else {
      heartbeats[heartbeat.hangout_id] = [hbObj]
    }
    return
  }
}

function listenHeartbeats (socket) {
  socket.on('heartbeat-start', updateHeartbeat)
  socket.on('heartbeat-stop', stopHeartbeat)

  // only add the checker if we're not connected with any other sockets
  if (heartbeatListener !== null) {
    heartbeatListener = setInterval(
      checkAllHeartbeats, 1000)
  }
}

module.exports =
{
  listen_heartbeats: listenHeartbeats
}
