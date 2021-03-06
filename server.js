//Setup web server and socket
var twitter = require('twitter'),
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);
//Setup twitter stream api
var twit = new twitter({
  consumer_key: '4oN7q8Yy3b8HVk8yCAA2yRvAP',
  consumer_secret: 'B8sZP2xFIltFTGg5rAAZVkTgXrzX0k46sLABuJJE6ZnkQGhgll',
  access_token_key: '4831804337-zpSo7PN8u5wHJOZTBFJyr3yE5oF1ZMDprojQ4eC',
  access_token_secret: 'OPkb1GgKAnK8I5q5FY8O9mtg6CIjcbwBBWhAk1TmpH4WZ'
    }),
    stream = null;
//Use the default port (for beanstalk) or default to 8081 locally
server.listen(process.env.PORT || 8081);
//Setup rotuing for app
app.use(express.static(__dirname + '/public'));
//Create web sockets connection.
io.sockets.on('connection', function(socket) {
    socket.on("start tweets", function() {
        var matchFlag = 1;
        if (stream === null) {
            //Connect to twitter stream passing in filter for entire world.
            twit.stream('statuses/filter', {
                'locations': '-180,-90,180,90'
            }, function(stream) {
                stream.on('data', function(data) {
                    // Does the JSON result have coordinates
                    try {
                        if (data.entities.hashtags) {
                            if (data.entities.hashtags.length != 0) {
                                var buff = data.entities.hashtags;
                                for (var i = 0; i < buff.length; i++) {
                                    var temp = buff[i].text;

                                    //Not exact match reg expression:
                                    if (matchFlag == 0) {
                                        var inputValue = "brexit davidcameron greece crisis eu merkel angela euro imf debt 2016 a";
                                        var keywords = inputValue.split(" ");
                                        var regexString = ".*(" + keywords[0];
                                        for (var i = 1; i < keywords.length; i++) {
                                            regexString += "|" + keywords[i];
                                        }
                                        regexString += ").*";
                                        var regex = new RegExp(regexString);
                                        var matches = temp.toString().toLowerCase().match(regex);
                                    }
                                    //Exact reg expression match
                                    else if (matchFlag == 1) {
                                        var inputValue = "brexit davidcameron greece crisis eu merkel angela euro imf debt 2016 a usa us america makeamericagreatagain for sale forsale shit tifu eli5";
                                        var keywords = inputValue.split(" ");
                                        var regexString = "^(" + keywords[0];
                                        for (var i = 1; i < keywords.length; i++) {
                                            regexString += "|" + keywords[i];
                                        }
                                        regexString += ")$";
                                        var regex = new RegExp(regexString);
                                        var matches = temp.toString().toLowerCase().match(regex);
                                    }

                                    if (matches.length > 0) {
                                        console.log(matches);
                                        if (data.coordinates) {
                                            if (data.coordinates !== null) {
                                                //If so then build up some nice json and send out to web sockets
                                                var outputPoint = {
                                                    "lat": data.coordinates.coordinates[0],
                                                    "lng": data.coordinates.coordinates[1]
                                                };
                                                socket.broadcast.emit("twitter-stream", outputPoint);
                                                //Send out to web sockets channel.
                                                socket.emit('twitter-stream', outputPoint);
                                            } else if (data.place) {
                                                if (data.place.bounding_box === 'Polygon') {
                                                    // Calculate the center of the bounding box for the tweet
                                                    var coord, _i, _len;
                                                    var centerLat = 0;
                                                    var centerLng = 0;
                                                    for (_i = 0, _len = coords.length; _i < _len; _i++) {
                                                        coord = coords[_i];
                                                        centerLat += coord[0];
                                                        centerLng += coord[1];
                                                    }
                                                    centerLat = centerLat / coords.length;
                                                    centerLng = centerLng / coords.length;
                                                    // Build json object and broadcast it
                                                    var outputPoint = {
                                                        "lat": centerLat,
                                                        "lng": centerLng
                                                    };
                                                    socket.broadcast.emit("twitter-stream", outputPoint);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } catch (err) {}
                    stream.on('limit', function(limitMessage) {
                        return console.log(limitMessage);
                    });
                    stream.on('warning', function(warning) {
                        return console.log(warning);
                    });
                    stream.on('disconnect', function(disconnectMessage) {
                        return console.log(disconnectMessage);
                    });
                });
                if (result instanceof Error) {
                    // handle the error safely
                    console.log('4/0=err', result)
                } else {
                    // no error occured, continue on
                    console.log('4/0=' + result)
                }
            });
        }
    });
    // Emits signal to the client telling them that the
    // they are connected and can start receiving Tweets
    socket.emit("connected");
});