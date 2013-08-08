#!/usr/bin/env node

var http = require('http'),
    Twit = require('twit');

//insert twitter develeoper credentials here
var T = new Twit({
  consumer_key:         '__YOUR_KEY_HERE__', 
  consumer_secret:      '__YOUR_KEY_HERE__',
  access_token:         '__YOUR_KEY_HERE__',
  access_token_secret:  '__YOUR_KEY_HERE__'
});


function translationURL(text) {
  return 'http://www.syslang.com/?src=en&dest=es&email=__YOUR_USERNAME_HERE__&password=__YOUR_PASSWORD_HERE__&outformat=json&text='+text;
};

//translates text using the translationURL.  encapsulated in its own function for future reusability
function translate(text, callback) {
  var str = '';
  http.get(translationURL(text), function(res) {
    //chunk received
    res.on('data', function (chunk) { str += chunk; });
    //finished recieving response
    res.on('end', function () { 
      callback(JSON.parse(str).translation);
    });
  }
)};

//Javier shares his javascript wisdom with the world! (new tweet)
//Javier selects one of the people he follows at random, takes their latest tweet, translates it
//to spanish, and tweets the translation
function expoundWisdom() {
  //choose a random person from the list of people that the tweetbot follows
  T.get('friends/ids', {}, function(err, reply) {
    var chosen_friend = reply.ids[Math.floor(Math.random() * reply.ids.length)];
		console.log('friend_id: ',chosen_friend);
		//get the chosen friend's most recent tweet and translate it
		T.get('statuses/user_timeline', {user_id : chosen_friend, count : 1}, function(err, reply) {
		  console.log('friend_status', reply[0].text);
		  translate(reply[0].text, function(trans) {
		    //remove @ symbols from translated text (prevents mentions/other peoples aggravation with my bot)
        trans = trans.replace(/@/g, '');
        //if the translated tweet is larger than the maximum length, cut off the end
        if (trans.length > 140)
          trans = trans.substr(0,140);
        console.log('new_status: ', trans);
        T.post('statuses/update', {status : trans}, function(err, reply) {
        });
      });
    });
	});
};

expoundWisdom();
//Expound wisdom once every hours
setInterval(function() {
  try {
    expoundWisdom();
  }
 catch (e) {
    console.log(e);
  }
},3600000);