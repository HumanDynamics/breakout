'use strict'

// Any filters that are shared across services are here
// decrypts data being sent out to users on service events.

const helpers = require('../helpers')
const transform_keys = helpers.transform_keys
const crypto = helpers.crypto

function participant_crypto_filter (data, connection) {
  data = transform_keys(data,
                        ['participant_id', 'participants'],
                        crypto.decrypt)
  /* data = json_transform(data, 'participants', function(ps){return _.map(ps, crypto.decrypt)});- */
  return data
}

module.exports = {
  encryptParticipantFilter: participant_crypto_filter
}
