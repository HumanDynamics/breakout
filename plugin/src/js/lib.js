define(["src/volumeCollector","feathers","socketio", "underscore", "gapi"],
       function(volumeCollector, feathers, io, underscore, gapi) {

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
               socket.emit("hangout::joined",
                           {
                               participant_id: thisHangout.getLocalParticipant().person.id,
                               hangout_participants: participantIds,
                               hangout_id: thisHangout.getHangoutId(),
                               hangout_url: thisHangout.getHangoutUrl(),
                               hangout_topic: thisHangout.getTopic()
                           });

               addHangoutListeners();
           });

           function addHangoutListeners() {
               volumeCollector.startVolumeCollection(socket);
               window.gapi.hangout.onParticipantsChanged.add(function(participantsChangedEvent) {
                   console.log("participants changed:", participantsChangedEvent.participants);
                   var currentParticipants = _.map(participantsChangedEvent.participants,
                                                   function(p) {
                                                       return p.person.id;
                                                   });
                   socket.emit("participantsChanged",
                               {
                                   hangout_id: window.gapi.hangout.getHangoutId(),
                                   participants: currentParticipants
                               });
               });
           }



       });
