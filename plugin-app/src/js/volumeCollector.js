define(function() {

    function startVolumeCollection () {

        ////////////////////////////////////////////////////////
        // {participantId: [<volume object>, ...]}
        var allVolumes = {};

        // {participantId: {'talking': <boolean>, 'time': <time of last
        // start talking event>}
        var talkState = {}

        // check for new participants every 5s
        var participantIds = []
        gapi.hangout.onApiReady.add(function(eventObj) {
            console.log("what?");
            setInterval(function() {
                // get the most recent participant list
                var newParticipantIds;
                newParticipantIds = _.map(gapi.hangout.getParticipants(),
                                          function(p) {
                                              return {'gid': p.person.id, 'hid': p.id};
                                          });
                participantIds = newParticipantIds;


                _.each(newParticipantIds, function(participant) {
                    var googleId = participant.gid;

                    // if it's a new participant
                    if (!_.has(allVolumes, googleId)) {
                        console.log("new participant: ", googleId);
                        allVolumes[googleId] = [];
                        talkState[googleId] = {'talking': false, 'time': null};
                    }

                    // check for participants that have left for each one
                    // that's left, just reset the data -- we can keep
                    // them as a key, but if they return we want them to
                    // start from scratch
                    var left = _.difference(participantIds, newParticipantIds);
                    _.each(left, function(participant) {
                        allVolumes[participant] = []
                        talkState[googleId] = {'talking': false, 'time': null};
                    });
                    
                });

            }, 5000);
        });

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
        var MIN_TALK_LENGTH = 500;

        // If we get no signal for this amount of time, consider them no
        // longer talking.
        var TALK_TIMEOUT = 1500;


        //////////////////////////////////////////
        
        // returns the number of ms between index i and the most recent
        // last talk event
        // TODO: These two can be abstracted out
        function timeSinceLastTalk(participantId, i) {
            var volumes = allVolumes[participantId];
            for (var j = i - 1; j >= 0; j--) {
                if (volumes[j].vol > MIN_VOLUME) {
                    return volumes[i].timestamp - volumes[j].timestamp;
                }
            }
        }

        // TODO: abstract out
        function timeSinceLastQuiet(participantId, i) {
            var volumes = allVolumes[participantId];
            for (var j = i - 1; j >= 0; j--) {
                if (volumes[j].vol < MIN_VOLUME) {
                    return volumes[i].timestamp - volumes[j].timestamp;
                }
            }
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
        }

        function insertTalkEvent(participantId, startTime, endTime, volumeData) {
            state.talkingHistoryCollection.insert({
                'participant_id': participantId,
                'hangout_id': state.hangoutId,
                'start_time': new Date(startTime),
                'end_time': new Date(endTime),
                //'volumes': volumeData  // TODO: remove to collect raw data
            });
        }

        // if the current value of `volumes` contains a distinct talk
        // event, send it to the server and remove it from the list.
        function checkTalkEvent(participantId) {
            var volumes = allVolumes[participantId];
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
                    lastTime = volumes[volumes.length - 1].timestamp - timeSinceLastTalk(participantId, volumes.length - 1);
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

        gapi.hangout.av.onVolumesChanged.add(
            function(evt) {
                // don't do anything if we're not collecting volumes
                if (!state.collectingVolumes) {
                    console.log("not collecting...");
                    return;
                }

                var eventVolumes = evt.volumes;
                _.each(eventVolumes, function(v, hangoutId, l) {
                    var participantId = _.find(participantIds, function(participant) {
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
            var googleId = participant.gid;
            var volumes = allVolumes[googleId];
            state['volumeCollector'] = setInterval(function() {
                if (talkState[googleId]['talking']) {
                    var now = Date.now()
                    var lastEventTime = volumes[volumes.length - 1].timestamp;
                    if ((now - lastEventTime) > TALK_TIMEOUT) {
                        console.log("stopped talking...");
                        talkState[googleId].talking = false;
                        lastTime = volumes[volumes.length - 1].timestamp - timeSinceLastTalk(googleId, volumes.length - 1);
                        console.log("new talk event (timeout):", talkState[googleId].time, lastTime);
                        insertTalkEvent(talkState[googleId].time, lastTime, volumes);
                        allVolumes[googleId] = [];
                    }
                }
            }(talkState), 50);
        });
    }

    function stopVolumeCollection() {
        //TODO: also need to stop the gapi onVolumesChanged
        clearInterval(state.silenceDetector); // clear silence setInterval
        state.collectingVolumes = false;
    }

    return {
        startVolumeCollection: startVolumeCollection,
        stopVolumeCollection: stopVolumeCollection
    }
    
});
