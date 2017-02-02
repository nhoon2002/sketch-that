var firebase = require('firebase');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var sequelize = require('sequelize');
var passport = require('passport');
var exphbs = require("express-handlebars");
var session = require("express-session");




var port = process.env.PORT || 8080;

// Requiring our models for syncing
var db = require("./models");

var app = express();


// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(process.cwd() + "/public"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
// app.use(app.router);

// Override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// // Set Handlebars.
// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

//Initialize Firebase







  app.listen(port, function() {
    // // Cookies
    // app.get('/', function(req, res) {
    //   console.log('Cookies: ', req.cookies);
    // });
    console.log('Connected on port ' + port);

});
