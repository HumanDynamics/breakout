// This Should be in both server and client in a lib folder
DDPConnection = (Meteor.isClient) ? DDP.connect("http://breakout.media.mit.edu:3000") : {};

// When creating a new collection on the client use:
if(Meteor.isClient) {
    // set the new DDP connection to all internal packages, which require one
    Meteor.connection = DDPConnection;
    
    // And then you subscribe like this:
    DDPConnection.subscribe("talkers");   
}
