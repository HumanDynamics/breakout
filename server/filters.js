var winston = require('winston');
var crypto = require('./crypto');
var _ = require('underscore');
var app = require('./app');
var json_transform = require('./json_utils').json_transform;


// decrypts data being sent out to users on service events.
function crypto_filter(data, connection) {
    data = json_transform(data, ['participant_id', 'participants'], crypto.decrypt);
    /* data = json_transform(data, 'participants', function(ps){return _.map(ps, crypto.decrypt)});- */
    return data;
}

// configures every filter in `filters` to run for every service in `services`.
// on every service event.
function configure_filters(filters, services) {
    _.each(services, function(service) {
        _.each(filters, function(filter) {
            app.service(service).filter(filter);
        });
    });
}

module.exports = {
    crypto_filter: crypto_filter,
    configure_filters: configure_filters
};
