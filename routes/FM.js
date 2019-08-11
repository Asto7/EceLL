const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');
const multer=require('multer');
const db = require('../config/database');
const fs=require('fs');
const path = require('path');
require('../models/fm');
const To = mongoose.model('FM');
require('../models/User');
const User = mongoose.model('users');


router.get('/', ensureAuthenticated, (req,res) => {
// console.log(req.body);
  To.find({user: req.user.email}).sort({creationDate:'descending'}).then(FM => {
    res.render('FM/index', {
      FM:FM
    })
  }) // find something in DB
});
// add form
router.get('/add', ensureAuthenticated, (req,res) => {
  res.render('FM/add');
});

// delete form
router.get('/delete/:id', ensureAuthenticated, (req,res) => {
  To.deleteOne({
    _id: req.params.id
  }).then(fm => {
    req.flash('success_msg', ' Successfully Deleted');
    res.redirect('/FM');
  })
});

router.post('/edit/:id', ensureAuthenticated, (req,res) => {
  To.findOne({_id:req.params.id}).then(fm=>{
fm.code=req.body.code;
fm.details=req.body.details;
fm.title=req.body.title;

fm.save().then(()=>{
  req.flash('success_msg', 'Saved Successfully');
  res.redirect('/FM');
  // res.render('FM/works');
})

  })
});

router.get('/visit/:id', ensureAuthenticated, (req,res) => {

  To.findOne({
    _id: req.params.id
  }).then(fm => {
    res.render('FM/visit',{fm:fm});

}).catch(err=>{console.log(err)})
})


router.get('/edit/:id', ensureAuthenticated, (req,res) => {
  // console.log("df");

  To.findOne({
    _id: req.params.id
  }).then(fm => {
// console.log(fm);
if(req.user.email==fm.user)
    res.render('FM/works',{fm:fm});
    else
    res.render('FM/NA');

}).catch(err=>{console.log(err)})

});
// process  form
router.put('/', ensureAuthenticated, (req,res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({
      text: 'Please add title'})
  }


    if (!req.body.details) {
      errors.push({
        text: 'Please add details'})
    }


  if (errors.length > 0) {
    res.render('FM/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
      code: req.body.code,

    });
  }



  else {
// console.log(X);

var newUser={
  title:req.body.title,
  user:req.user.email,
code:req.body.code,
details:req.body.details,


}
console.log(newUser);
    new To(newUser).save().then(fm => {
      // console.log(fm)
      req.user.save().then(function(result){
        req.flash('success_msg', 'Added Successfully');
        res.redirect('/FM');
      })

    })
  }

});


router.post('/find', ensureAuthenticated, (req,res) => {
  // console.log("df");
User.findOne({  email: req.body.search}).then((user)=>{
if(user==null){ res.render('FM/error');}
else{  To.find({
    user: req.body.search
  }).sort({creationDate:'descending'}).then(fm => {
    res.render('FM/find',{fm:fm});

}).catch(err=>{console.log(err)})
}
});
});


module.exports = router;
