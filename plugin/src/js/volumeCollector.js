define(["feathers", "socketio", "underscore", 'underscore_string'], function(feathers, io, _, s) {

    // {participantId: [<volume object>, ...]}
    var allVolumes = {};

    // {participantId: {'talking': <boolean>, 'time': <time of last
    // start talking event>}
    var talkState = {};

    // check for new participants every 5s
    var participantIds = [];

    var consent = true;


    //TODO: do this on a websocket event instead?
    var onParticipantsChanged = function(participants) {
        console.log("volumeCollector onParticipantsChanged");
        var newParticipantIds = _.map(participants,
                                  function(p) {
                                      return {'gid': p.person.id, 'hid': p.id};
                                  });

        if (_.isEqual(participantIds, newParticipantIds)) {
            return;
        }

        participantIds = newParticipantIds;

        _.each(newParticipantIds, function(participant) {
            var googleId = participant.gid;
            if (!_.has(allVolumes, googleId)) {
                allVolumes[googleId] = [];
                talkState[googleId] = {'talking': false, 'time': null};
            }
        });


        // check for participants that have left for each one
        // that's left, just reset the data -- we can keep
        // them as a key, but if they return we want them to
        // start from scratch
        var left = _.difference(participantIds, newParticipantIds);
        _.each(left, function(participant) {
            allVolumes[participant] = [];
            talkState[participant.gid] = {'talking': false, 'time': null};
        });
    };


    function startVolumeCollection (socket) {
        window.state.collectingVolumes = true;

        console.log("[volumeCollector] participant ids:", participantIds);

        // // change collecting state
        // if (window.state) {
        //     if (!window.state.collectingVolumes) {
        //         console.log("not collecting volumes...");
        //         return;
        //     }
        //     state.collectingVolumes = true;
        // }



        //////////////////////////////////////////

        // constants for talking 'algorithm'
        var MIN_VOLUME = 2; // minimum volume to count
        // if at least this amount of time happens between a talk signal
        // and a null signal, they are considered to have stopped talking.
        var MIN_SILENCE_LENGTH = 1000;
        // if at least this amount of time happens between a null signal
        // and a talk signal, they are considered to have started talking.
        var MIN_TALK_LENGTH = 200;

        // If we get no signal for this amount of time, consider them no
        // longer talking.
        var TALK_TIMEOUT = 1000;


        //////////////////////////////////////////

        // returns the number of ms between index i and the most recent
        // last talk event
        // TODO: These two can be abstracted out
        function timeSinceLastTalk(participantId, i) {
            var volumes = allVolumes[participantId];
            for (var j = i - 1; j >= 0; j--) {
                if (volumes[j].vol >= MIN_VOLUME) {
                    return volumes[i].timestamp - volumes[j].timestamp;
                }
            }
            return null;
        }

        // TODO: abstract out
        function timeSinceLastQuiet(participantId, i) {
            var volumes = allVolumes[participantId];
            for (var j = i - 1; j >= 0; j--) {
                if (volumes[j].vol < MIN_VOLUME) {
                    return volumes[i].timestamp - volumes[j].timestamp;
                }
            }
            return null;
        }

        // returns true if the user has stopped talking.  defines 'stopped
        // talking' as the user not having a volume event greater than
        // MIN_VOLUME for over MIN_SILENCE_LENGTH milliseconds.
        function stoppedTalking(participantId) {
            var volumes = allVolumes[participantId];
            if (volumes[volumes.length - 1].vol <= MIN_VOLUME) {
                return timeSinceLastTalk(participantId, volumes.length - 1) > MIN_SILENCE_LENGTH;
            }
            return false;
        }

        function startedTalking(participantId) {
            var volumes = allVolumes[participantId];
            if (volumes[volumes.length - 1].vol > MIN_VOLUME) {
                //console.log("over min volume threshold, testing time..");
                var res = timeSinceLastQuiet(participantId, volumes.length - 1) > MIN_TALK_LENGTH;
                //console.log("time since quiet:", timeSinceLastQuiet(volumes.length - 1));
                return res;
            }
            return false;
        }

        function insertTalkEvent(participantId, startTime, endTime, volumeData) {
            console.log("inserting talk event:", startTime, endTime);

            // if we don't have consent, don't send anything.
            if (!consent) {
                console.log("no consent, not sending...");
                return;
            }

            socket.emit("talking_history::create",
                        {
                            'participant_id': participantId,
                            'hangout_id': window.gapi.hangout.getHangoutId(),
                            'start_time': new Date(startTime).toISOString(),
                            'end_time': new Date(endTime).toISOString()
                            //'volumes': volumeData  // comment to not collect raw data
                        },
                        {},
                        function(error, data) {
                            if (error) {
                                console.log("unable to create talking history event...", error);
                            } else {
                                console.log("created talking history event:", data);
                            }
                        });
        }

        // if the current value of `volumes` contains a distinct talk
        // event, send it to the server and remove it from the list.
        function checkTalkEvent(participantId) {
            var volumes = allVolumes[participantId];

            if (participantId == window.gapi.hangout.getLocalParticipant().person.id) {
                if (window.gapi.hangout.av.getMicrophoneMute()) {
                    console.log("Local participant muted, continuing...");
                    return;
                }
            }

            if (volumes.length < 3) {
                console.log("no volumes to examine, continuing...");
                return;
            }
            if (talkState[participantId].talking) {
                // console.log("currently talking...");
                // Talking -> not talking
                if (stoppedTalking(participantId)) {
                    talkState[participantId].talking = false;
                    // get the last time talking
                    var lastTime = volumes[volumes.length - 1].timestamp - timeSinceLastTalk(participantId, volumes.length - 1);

                    //TODO:
                    // we don't want to register a talk event that is
                    // duration == 0s  -- (or negative) -- why are we getting negative values??
                    if (lastTime == talkState[participantId].time) {
                        return;
                    }
                    // start and end of talking!
                    console.log("new talk event:", talkState[participantId].time, lastTime);
                    insertTalkEvent(participantId, talkState[participantId].time, lastTime, volumes);
                    volumes = [];

                }
            } else if (!talkState[participantId].talking) {
                if (startedTalking(participantId)) {
                    console.log("[id ", participantId, "] just started talking!");
                    talkState[participantId].time = Date.now();
                    talkState[participantId].talking = true;
                }
            }
        }

        window.gapi.hangout.av.onVolumesChanged.add(
            function(evt) {
                // don't do anything if we're not collecting volumes
                if (!window.state.collectingVolumes) {
                    console.log("not collecting...");
                    return;
                }

                var eventVolumes = evt.volumes;
                _.each(eventVolumes, function(v, hangoutId, l) {

                    // if broadcast is there, trash it. doesn't seem to be real people.
                    if (s.include(hangoutId, 'broadcast')) {
                        return;
                    }

                    if (participantIds.length == 0) {
                        console.log("haven't loaded participants yet");
                        return;
                    }

                    // find the participant that spoke
                    var participantId = _.find(participantIds, function(participant) {
                        //console.log(participant.hid, hangoutId);
                        //console.log(participant.hid == hangoutId);
                        return participant.hid == hangoutId;
                    });

                    // if we don't have them in our records, skip.
                    if (!participantId) {
                        console.log("google id not in records yet");
                        return;
                    }

                    // if it exists, get the googleid...
                    var googleId = participantId.gid;

                    var time = Date.now();
                    // we use google ids instead of hangout ids
                    allVolumes[googleId].push({'vol': v,
                                               'timestamp': time});
                    checkTalkEvent(googleId);
                });
            });


        // silence detector
        // check if it's been over TALK_TIMEOUT ms since we last got an
        // event. If so, then they're not talking.
        _.each(participantIds, function(participant) {
            console.log("participant:", participant);
            var googleId = participant.gid;
            var volumes = allVolumes[googleId];
            window.state['volumeCollector'] = window.setInterval(function() {
                if (talkState[googleId]['talking']) {
                    var now = Date.now();
                    var lastEventTime = volumes[volumes.length - 1].timestamp;
                    if ((now - lastEventTime) > TALK_TIMEOUT) {
                        console.log("stopped talking...");
                        talkState[googleId].talking = false;
                        var lastTime = volumes[volumes.length - 1].timestamp - timeSinceLastTalk(googleId, volumes.length - 1);
                        console.log("new talk event (timeout):", talkState[googleId].time, lastTime);
                        insertTalkEvent(talkState[googleId].time, lastTime, volumes);
                        allVolumes[googleId] = [];
                    }
                }
            }(talkState), 50);
        });
    }

    function stopVolumeCollection() {
        //TODO: also need to stop the window.gapi onVolumesChanged
        window.clearInterval(window.state.silenceDetector); // clear silence setInterval
        window.state.collectingVolumes = false;
    }

    return {
        startVolumeCollection: startVolumeCollection,
        onParticipantsChanged: onParticipantsChanged,
        stopVolumeCollection: stopVolumeCollection
    };

});
