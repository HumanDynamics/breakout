var assert = require('assert');
var supertest = require('supertest');
var should = require('should');

var server = supertest.agent('http://localhost:3000');

// test environment setup
before(function() {

});


// test environment tear down
after(function(){

});

/////////////////////////////////////////
// tests /hangouts
/////////////////////////////////////////
describe('Hangouts API', function() {

  // check POST
  /////////////////////////////////////////
  describe('POST', function() {
    var h1id, h2id;
    it('should return created hangout', function(done) {
      server.post('/hangouts').send({})
        .expect('Content-type',/json/)
        .expect(201)
        .end(function(err,res){
          res.status.should.equal(201);
          res.body.should.have.ownProperty('start_time');
          res.body.should.have.ownProperty('_id');
          h1id = res.body._id;
          done();
        });

    });

    it('should return created hangout (2)', function(done) {
      server.post('/hangouts').send({})
        .expect('Content-type',/json/)
        .expect(201)
        .end(function(err,res){
          res.status.should.equal(201);
          res.body.should.have.ownProperty('start_time');
          res.body.should.have.ownProperty('_id');
          h2id = res.body._id;
          done();
        });
    });

    it('should create unique hangouts', function() {
      assert.notEqual(h1id, h2id);
    });
  });


  // check GET
  /////////////////////////////////////////
  describe('GET - all', function() {
    var h1id, h2id;

    // seed
    before(function(done) {
      server.post('/hangouts').send({})
        .end(function(err,res) {
          h1id = res.body._id;
          server.post('/hangouts').send({})
            .end(function(err,res) {
              h2id = res.body._id;
              done();
            });
        });
    });

    it('should return hangouts in db', function(done) {
      server.get('/hangouts')
        .expect('Content-type',/json/)
        .expect(200)
        .end(function(err,res) {
          res.status.should.equal(200);
          res.body.should.matchAny(function (value) {
            value.should.have.ownProperty('_id').eql(h1id);
          });
          done();
        });
    });

    it('should return hangouts in db (2)', function(done) {
      server.get('/hangouts')
        .expect('Content-type',/json/)
        .expect(200)
        .end(function(err,res) {
          res.status.should.equal(200);
          res.body.should.matchAny(function (value) {
            value.should.have.ownProperty('_id').eql(h2id);
          });
          done();
        });
    });

  });

});
