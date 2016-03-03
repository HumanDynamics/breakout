define(["src/volumeCollector", "src/heartbeat", "src/charts", "src/consent", "feathers", "socketio", "underscore", "gapi", "jquery"],
       function(volumeCollector, heartbeat, charts, consent, feathers, io, underscore, gapi, $) {

           // initialize global state object
           window.state = {};
           window.state.url = "breakout-dev.media.mit.edu";
           
           // set up raw socket for custom events.
           var socket = io.connect(window.state.url, {
               'transports': [
                   'websocket',
                   'flashsocket',
                   'jsonp-polling',
                   'xhr-polling',
                   'htmlfile'
               ]});

           /////////////////////////////////////////////////////////////////////
           // UI stuff
           $('#move-footer').click(function() {
               console.log("clicked!");
               if($('#footer').hasClass('slide-up')) {
                   $('#footer').addClass('slide-down', 150, 'linear');
                   $('#footer').removeClass('slide-up');
                   $('#upbutton').removeClass('upside-down', 150, 'linear');
               } else {
                   $('#footer').removeClass('slide-down');
                   $('#footer').addClass('slide-up', 150, 'linear');
                   $('#upbutton').addClass('upside-down', 150, 'linear');
               }
           });

           $('.modal-trigger').leanModal();
           $('#mm-holder-consent').hide();

           // all links need to open in new tab.
           $('a').each(function() {
               var a = new RegExp('/' + window.location.host + '/');
               if(!a.test(this.href)) {
                   $(this).click(function(event) {
                       event.preventDefault();
                       event.stopPropagation();
                       window.open(this.href, '_blank');
                   });
               }
           });

           function ui_consent(consentVal) {
               $('#consent-checkbox').prop('checked', consentVal);
               if (consentVal == true) {
                   $('#mm-holder-consent').hide();
               } else {
                   $('#mm-holder-consent').show();
               }
               
           }



           ///////////////////////////////////////////////////////////////////////
           // Everything else

           // var app = feathers().configure(feathers.socketio(s));
           // var hangouts = app.service('hangouts');
           // var talktimes = app.service('talktimes');

           function collection_consent(consentVal) {
               if (!consentVal) {
                   volumeCollector.consent = false;
               } else {
                   volumeCollector.consent = true;
               }
           }

           function get_participant_objects(participants) {
               return _.map(participants,
                           function(p) {
                               return {
                                   participant_id: p.person.id,
                                   hangout_id: window.gapi.hangout.getHangoutId(),
                                   name: p.person.displayName,
                                   locale: p.locale,
                                   image_url: p.person.image.url
                               };
                           });
           }
           


           // once the google api is ready...
           window.gapi.hangout.onApiReady.add(function(eventObj) {
               console.log('hangout object:',  window.gapi.hangout);
               var thisHangout = window.gapi.hangout;
               console.log("hangoutId:", thisHangout.getHangoutId());
               
               var participants = get_participant_objects(window.gapi.hangout.getParticipants());
               
               var localParticipant = window.gapi.hangout.getLocalParticipant();

               volumeCollector.onParticipantsChanged(window.gapi.hangout.getParticipants());
               
               socket.emit("hangout::joined",
                           {
                               participant_id: localParticipant.person.id,
                               participant_name: localParticipant.person.displayName,
                               participant_locale: localParticipant.locale,
                               participant_image: localParticipant.person.image.url,
                               hangout_participants: participants,
                               hangout_id: thisHangout.getHangoutId(),
                               hangout_url: thisHangout.getHangoutUrl(),
                               hangout_topic: thisHangout.getTopic()
                           });

               // the only other thing sent to maybe_start_heartbeat
               // is a gapi onparticipantsChanged event, so just follow the format...
               if (participants.length == 1) {
                   heartbeat.register_heartbeat(socket);
                   heartbeat.maybe_start_heartbeat([localParticipant]);
               }

               function process_consent(consentVal) {
                   console.log("processing consent");
                   // get rid of those stupid click events; if we
                   // don't, they will be called twice later... (god I hate jquery)
                   $('#consent-button').off('click.consent');
                   $('#no-consent-button').off('click.consent');
                   if (consentVal === true) {
                       addHangoutListeners();
                       charts.start_meeting_mediator(socket);
                       ui_consent(consentVal);
                       collection_consent(consentVal);
                       $('#post-hoc-consent').off('click.consent');
                       $('#consent-checkbox').off('change');
                       $('#consent-checkbox').prop('disabled', true);
                   } else {
                       console.log("didn't get consent from form...");
                       ui_consent(consentVal);
                       collection_consent(consentVal);
                       $('consent-checkbox').prop('disabled', false);
                   }
               }

               consent.get_consent(socket,
                                   localParticipant.person.id,
                                   thisHangout.getHangoutId(),
                                   process_consent);
               
               $('#post-hoc-consent').on('click.consent', function(evt) {
                   consent.display_consent(process_consent);
               });

               $('#consent-checkbox').on('change', function(evt) {
                   consent.display_consent(process_consent);
               });
           });

           function addHangoutListeners() {
               console.log("adding hangout listeners...");
               // start collecting volume data
               volumeCollector.startVolumeCollection(socket);

               // start heartbeat listener
               heartbeat.register_heartbeat(socket);
               
               window.gapi.hangout.onParticipantsChanged.add(function(participantsChangedEvent) {
                   console.log("participants changed:", participantsChangedEvent.participants);
                   var currentParticipants = get_participant_objects(participantsChangedEvent.participants);

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
