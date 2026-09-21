require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');
var cors = require('cors');
var passport = require('passport');

// Connect to database and register models
require('./app_api/models/db');

// Configure Passport strategies
require('./app_api/config/passport');

var indexRouter = require('./app_server/routes/index');
var usersRouter = require('./app_server/routes/users');
var apiRouter = require('./app_api/routes/index');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(
  path.join(__dirname, 'app_server', 'views', 'partials')
);

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));

// Allow Angular SPA to access Express API
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Website routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// API routes
app.use('/api', apiRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Centralized error handler
app.use(function(err, req, res, next) {
  // Handle expired or invalid JWTs without exposing internal details
  if (err.name === 'UnauthorizedError') {
    return res
      .status(401)
      .json({ message: 'Unauthorized' });
  }

  // Return JSON errors for API requests
  if (req.originalUrl.startsWith('/api/')) {
    const status = err.status || 500;

    return res
      .status(status)
      .json({
        message:
          status === 404
            ? 'API resource not found'
            : 'An unexpected API error occurred'
      });
  }

  // Render the normal error page for website requests
  res.locals.message = err.message;
  res.locals.error =
    req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;