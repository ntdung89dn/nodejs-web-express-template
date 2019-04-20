var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var connection  = require('./models/mysql');
var passport = require('passport');
var session = require('express-session');
var randomstring = require("randomstring");
var mongoose = require('mongoose');

const keys = require('./config/keys.js');
require('./services/passport');

mongoose.connect(keys.mongoURI,{ useNewUrlParser: true,useCreateIndex: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("CONNECTED!");
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css',express.static(path.join(__dirname, 'node_modules/bulma/css')));
app.use('/js',express.static(path.join(__dirname, 'node_modules/axios/dist')));

app.use(passport.initialize());
app.use(passport.session());
app.use(session({
  secret: randomstring.generate(),
  httpOnly: true,
  resave: false,
  saveUninitialized: true,
  maxAge: 60 * 60 * 1000,
  secure: false,
  overwrite: false
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
