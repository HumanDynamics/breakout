define(["src/volumeCollector", "src/heartbeat", "feathers","socketio", "underscore", "gapi"],
       function(volumeCollector, heartbeat, feathers, io, underscore, gapi) {

           // initialize global state object
           window.state = {};
           window.state.url = "breakout-dev.media.mit.edu";

           // var s = io();
           // var app = feathers().configure(feathers.socketio(s));
           // var hangouts = app.service('hangouts');

           // set up raw socket for custom events.
           var socket = io.connect(window.state.url, {'transports': [
               'websocket',
               'flashsocket',
               'jsonp-polling',
               'xhr-polling',
               'htmlfile'
           ]});


           // once the google api is ready...
           window.gapi.hangout.onApiReady.add(function(eventObj) {
               console.log('hangout object:',  window.gapi.hangout);
               var thisHangout = window.gapi.hangout;
               console.log("hangoutId:", thisHangout.getHangoutId());
               var participantIds = _.map(window.gapi.hangout.getParticipants(),
                                          function(p) {
                                              return p.person.id;
                                          });
               console.log("participantIds:", participantIds);
               var localParticipant = window.gapi.hangout.getLocalParticipant();

               volumeCollector.onParticipantsChanged(window.gapi.hangout.getParticipants());
               
               socket.emit("hangout::joined",
                           {
                               participant_id: localParticipant.person.id,
                               participant_name: localParticipant.person.displayName,
                               participant_locale: localParticipant.locale,
                               participant_image: localParticipant.person.image.url,
                               hangout_participants: participantIds,
                               hangout_id: thisHangout.getHangoutId(),
                               hangout_url: thisHangout.getHangoutUrl(),
                               hangout_topic: thisHangout.getTopic()
                           });

               // if (participantIds.length == 1) {
               //     heartbeat.registerHeartbeat();
               // }

               addHangoutListeners();
           });

           function addHangoutListeners() {
               // start collecting volume data
               volumeCollector.startVolumeCollection(socket);

               // start heartbeat listener
               heartbeat.register_heartbeat(socket);
               
               window.gapi.hangout.onParticipantsChanged.add(function(participantsChangedEvent) {
                   console.log("participants changed:", participantsChangedEvent.participants);
                   var currentParticipants = _.map(participantsChangedEvent.participants,
                                                   function(p) {
                                                       return {
                                                           participant_id: p.person.id,
                                                           hangout_id: window.gapi.hangout.getHangoutId(),
                                                           name: p.person.displayName,
                                                           locale: p.locale,
                                                           image_url: p.person.image.url
                                                       };
                                                   });

                   // send the new participants to the volume collector, to reset volumes etc.
                   volumeCollector.onParticipantsChanged(participantsChangedEvent.participants);
                   
                   console.log("sending:", currentParticipants);
                   socket.emit("participantsChanged",
                               {
                                   hangout_id: window.gapi.hangout.getHangoutId(),
                                   participants: currentParticipants
                               });
               });
           }



       });
