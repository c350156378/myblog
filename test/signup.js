var path = require('path');
var assert = require('assert');
var request = require('supertest');
var app = require('../index');
var User = require('../lib/mongo').User;

describe('signup', function() {
  describe('POST /signup', function(){
    var agent = request.agent(app);
    beforeEach(function(done) {
      User.create({
        name: 'aaa',
        password: '123456',
        avatar: '',
        gender: 'x',
        bio: ''
      })
      .exec()
        .then(function(){
          done();
        })
        .catch(done);
    });
    afterEach(function (done) {
      User.remove({})
        .exec()
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('wrong name', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: '' })
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/名字1-10个字符串/));
          done();
        });
    });

    it('wrong gender', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({name: 'nswbmw', gender: 'a'})
        .redirects()
        .end(function(err, res){
          if (err) return done(err);
          assert(res.text.match(/性别只能是m,f, x/));
          done();
        });
    });

    it('duplicate name', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: 'aaa', gender: 'm', bio: 'noder', password: '123456', repassword: '123456'})
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/用户名已被占用/));
          done();
        });
    });

    it('success', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field( {name: 'nswbmw', gender: 'm', bio: 'noder', password: '123456', repassword: '123456'})
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/注册成功/));
          done();
        });
    });
  });
});
