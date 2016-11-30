var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

router.get('/', checkNotLogin, function(req, res, next){
  res.render('signup');
});

router.post('/', checkNotLogin, function(req, res, next){
  var name = req.fields.name;
  var gender = req.fields.gender;
  var bio = req.fields.bio;
  var avatar = req.files.avatar.path.split(path.sep).pop();
  var password = req.fields.password;
  var repassword = req.fields.repassword;

  try {
    if (!(name.length >= 1 && name.length <= 10)){
      throw new Error('名字1-10个字符串');
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1){
      throw new Error('性别只能是m,f, x');
    }
    if (!(bio.length >= 1 && bio.length <= 30)){
      throw new Error('个人简介请限制在1-30字符');
    }
    if (!req.files.avatar.name){
      throw new Error('缺少头像');
    }
    if (password.length < 6){
      throw new Error('密码至少6个字符');
    }
    if (password !== repassword){
      throw new Error('两次输入的密码不一直');
    }
  } catch (e){
    req.flash('error', e.message);
    return res.redirect('/signup');
  }

  password = sha1(password);

  var user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  };

  UserModel.create(user)
    .then(function(result){
      user = result.ops[0];
      delete user.password;
      req.session.user = user;
      req.flash('success', '注册成功');
      res.redirect('/posts');
    })
    .catch(function(e){
      if (e.message.match('E11000 duplicate key')) {
        req.flash('error', '用户名已被占用');
        return res.redirect('/signup');
      }
      next(e);
    });
});

module.exports = router;
