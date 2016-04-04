// Listener registeres all the primus listeners for this plugin
// instance.
define(["underscore"], function (underscore) {
  var HEARTBEAT_FREQUENCY = 3000
  var _socket = null
  var _heartbeat_id = null

  function _send_heartbeat () {
    _socket.emit('heartbeat-start', {
      meeting: window.gapi.hangout.getHangoutId(),
      participant: window.gapi.hangout.getLocalParticipant().person.id
    })
  }

  function _startHeartbeat () {
    console.log('starting the heartbeat...')
    _send_heartbeat()
    var heartbeat = window.setInterval(_send_heartbeat, HEARTBEAT_FREQUENCY)
    return heartbeat
  }

  function _stopHeartbeat () {
    window.clearInterval(_heartbeat_id)
    console.log('stopping the heartbeat...')
    _socket.emit('heartbeat-stop', {
      meeting: window.gapi.meeting.getHangoutId(),
      participant: window.gapi.meeting.getLocalParticipant().person.id
    })
    _heartbeat_id = null
  }

  // starts a heartbeat if one isn't already running.
  function maybeStartHeartbeat () {
    if (_heartbeat_id != null) {
      _startHeartbeat()
    }
  }

  function maybeStopHeartbeat () {
    if (_heartbeat_id != null) {
      _stopHeartbeat()
    }
  }

  // TODO: How do we handle when someone joins???

  function registerHeartbeat (socket) {
    console.log('registering heartbeat listener')
    _socket = socket
  }

  return {
    register_heartbeat: registerHeartbeat,
    maybe_start_heartbeat: maybeStartHeartbeat,
    maybe_stop_heartbeat: maybeStopHeartbeat()
  }
})
