// Each of these collections are partitioned into individual 'hangout'
// groups.

// Talkers for a particular hangout. 
Talkers = new Mongo.Collection("talkers");
//Partitioner.partitionCollection(Talkers, {index: {timestamp: 1}});

// Followers for a particular hangout.
Followers = new Mongo.Collection("followers");
//Partitioner.partitionCollection(Followers, {index: {timestamp: 1}});
