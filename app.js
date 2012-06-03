
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , io = require('socket.io');

var app = module.exports = express.createServer();

// Sockect.io configuration
io = io.listen(app);
io.configure(function () {
  io.set('transports', ['websocket', 'xhr-polling']);
});

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

// Custom package.js handler for dynamic slide loading
app.get('/package.js', routes.packagejs);

// Socket Routes
io.sockets.on('connection', function (socket) {

  socket.on('set presenter', function(){
    socket.set('presenter', true, function(){
      socket.emit('ready');
    });
  });

  socket.on('slideChanged', function(slideIndex){
    socket.get('presenter', function(err, isPresenter){
      if(isPresenter){
        socket.broadcast.emit('changeSlide', slideIndex);
      }
    });
  });

});

app.listen(8888, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

