var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
var nodeMailer = require('nodemailer');

var index = require('./routes/index');
var http = require('http');
var enforce = require('express-sslify');

var app = express();

//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = process.env.MONGODB_URI ;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(enforce.HTTPS({ trustProtoHeader: true }))

// http.createServer(app).listen(app.get('port'), function() {
//     console.log('Express server listening on port ' + app.get('port'));
// });

app.use(compression()); //Compress all routes
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

app.use('/', index);

var Player = require('./models/player');

app.get('/search/', function(req, res) {
    var term = new RegExp(req.query.q.toLowerCase(), 'i');
    var query = Player.find({$or:[{ plain_name: term }, {club: term}]}).sort({rating: -1});
    // Execute query in a callback and return players list
    query.exec(function(err, players) {
        if (!err) {
            // Construct the json result set
            var result = [];
            for (var i = 0; i < players.length; i++) {
            	var p = players[i];
            	result.push({
            		'id': i,
            		'text': p.name,
            		's3url': p.s3url,
            		'pos': p.pos,
            		'age': p.age,
            		'club': p.club,
            		'rating': p.rating
            	});
            }
            res.send(result, {
                'Content-Type': 'application/json'
            }, 200);
        } else {
            res.send(JSON.stringify(err), {
                'Content-Type': 'application/json'
            }, 404);
        }
    });
});

var auth;

if(process.env.NODE_ENV === 'production'){
    auth = process.env;
} else {
    auth = require('./config.json');
}


var transporter = nodeMailer.createTransport({
  service: 'Sendgrid',
  auth: {
    user: auth.SENDGRID_USERNAME, pass: auth.SENDGRID_PASSWORD
  }
});

app.post('/send_email/', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var message = req.body.message;

    //Those ${} things that you see are called template literals
    //They are a way of inserting variables inside strings
    transporter.sendMail({
        from: email,
        to: "whiplashoo721@gmail.com",
        subject: `Message from ${name}` ,
        html: `<h4>${message}</h4>`
        }, (err, info)=>{
            if(err){
                res.send(err);
            }
            else{
                res.status(200).json({
                success: true,
                message: 'Email Sent'
                });
            }
        });

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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