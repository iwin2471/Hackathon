var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/Safood');

var userSchema = mongoose.Schema({
    userid: {type: String, unique: true},
    username: {type: String},
    password: {type: String},
    profileImage: {type: String},
    apikey: {type: String},
    groupid: {type: String},

    history:[{
       foodname:{type: String},
       searchdate:{type: Date}
    }],

    exception: {
        religion: [String],
        allergy: [String],
    }
});

var userGroupSchema = mongoose.Schema({
    groupname: {type: String},
    groupid: {type: String},
    admin: {type: String},
    members: [String],
    limit: {type: Number},
    img_url: {type: String},

    memo:[{
      title: {type: String},
      content: {type: String},
      color: {type: Number},
      foods: [String],
      have: {type: String}
    }]
});

var foodSchema = mongoose.Schema({
    name: {type: String},
    foodid: {type: String},
    thumbnail: {type: String},
    barcode: {type: String},
    foodAllergic: {type: String},
    foodIngredient: {type: String},
});

var safoodGroupSchema = mongoose.Schema({
    id: {type: String},
    name: {type: String},
    admin: {type: String},
    foodList: {type: Array}
});

var fooddicSchema = mongoose.Schema({
    id: {type: String},
    name: {type: String},
    img_url: {type: String},
    material: [String],
    content: {type: String}
})

User = mongoose.model("User", userSchema);
UserGroup = mongoose.model("UserGroup", userGroupSchema);
Food = mongoose.model("Food", foodSchema);
SafoodGroup = mongoose.model("SafoodGroup", safoodGroupSchema);
FoodDic = mongoose.model("FoodDic", fooddicSchema);

var routes = require('./routes/index');
var auth = require('./routes/auth');
var img = require('./routes/img');
var dbin = require('./routes/dbin');
var search = require('./routes/search');
var group = require('./routes/group');
var food = require('./routes/food');
var safood = require('./routes/safood');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/auth', auth);
app.use('/db', dbin);
app.use('/search', search);
app.use('/img', img);
app.use('/group', group);
app.use('/food', food);
app.use('/safood', safood);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
