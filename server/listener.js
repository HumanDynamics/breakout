var services = require('./services');
var _ = require('underscore');

// register all listening functions


function createHangout(hangout) {
    services.hangoutService.create(
        {
            id: hangout.hangout_id,
            url: hangout.hangout_url,
            topic: hangout.hangout_topic,
            active: true,
            participants: hangout.participantIds,
            end_time: null
        }, {}, function(error, data) {
            if (!error) {
                console.log("Successfully created hangout, ", hangout.hangout_id);
            }
        });
}

// function addParticipantToHangout(participantId, hangoutId) {
//     services.hangoutService.
// }



// hangout::joined
// emitted when a user joins a hangout.
// provides data:
// participantId, hangout_participants, hangout_id, hangout_url, hangout_topic
var listenHangoutJoined = function(socket) {
    socket.on("hangout::joined", function(data) {
        console.log("hangout joined event, data:", data);

        // might need to be app.service('hangout') or something, see
        // http://feathersjs.com/learn/validation/
        services.hangoutService.find(
            {
                hangout_id: data.hangout_id,
                $limit: 1
            },
            function(error, hangout) {
                if (hangout.length == 0) {
                    // hangout doesn't exist
                    createHangout(data);
                } else {
                    console.log("found a hangout:", error, hangout);
                    if ( _.contains(hangout.participants, data.participantId )) {
                        console.log("participant is in the hangout!:", hangout.participants, data.participantId);
                    } else {
                        console.log("participant not currently in hangout, adding...");
                    }
                }
            });
    });
};

            
function listen(socket) {
    listenHangoutJoined(socket);
}

module.exports = {
    listen: listen
};
