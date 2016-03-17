var _ = require('underscore');
var winston = require('winston');

// general json transform on object.
// any time there's a {k: v} pair in obj where k is in `ids`,
// `transform` is run on the value.
function json_transform(obj, ids, transform) {
    return JSON.parse(JSON.stringify(obj, function(key, value) {
        if (value !== null && _.contains(ids, key)) {
            if (Array.isArray(value)) {
                return _.map(value, transform);
            } else {
                return transform(value);
            }
        } else {
            return value;
        }
    }));
}

module.exports = {
    json_transform: json_transform
};
