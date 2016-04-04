'use strict'

const assert = require('assert')
const Faker = require('Faker')

const app = require('../../../src/app')
var mongo = require('mocha-mongo')(app.get('mongodb'))

var ready = mongo.ready()

describe('meeting service', () => {
  var testMeeting = {
    _id: Faker.Helpers.randomNumber(500).toString(),
    participants: ['p1', 'p2', 'p3'],
    startTime: Faker.Date.recent(),
    active: true
  }

  console.log('test meeting:', testMeeting)

  it('registered the meeting service', () => {
    assert.ok(app.service('meetings'))
  })

  it('creates a new meeting', () => {
    app.service('meetings')
       .create(testMeeting, {})
       .then((meeting) => {
         assert(meeting === testMeeting)
         return meeting
       }).catch((err) => {
         done(err)
       })
  })

  it('encrypted the new meeting', ready(function (db, done) {
    db.collection('meetings').find(
      {
        '_id': testMeeting._id
      },
      function (error, cursor) {
        if (error) {
          done(error)
        }
        cursor.toArray(function (err, documents) {
          if (err) {
            done(err)
          }
          var dbMeeting = documents[0]
          console.log('participants:', dbMeeting)
          assert(dbMeeting.participants !== testMeeting.participants)
          done()
        })
      })
  }))
})
