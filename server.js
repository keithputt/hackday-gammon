var express = require("express");
var bodyParser  = require('body-parser');
var request = require('request');
var parser = require('./parser.js');

var jsonParser = bodyParser.json()

var app = express();

app.post('/strip', jsonParser, function(req, res){

	console.log( " [+] Parsing " + req.body.url );

	var url = req.body.url;

        request(url, function (error, response, html) {
                if (!error && response.statusCode == 200) {
                        var response = parser.parse(html);
			res.send( response );
		}
	});
});

app.get('/', function(req, res){
	res.send( '<html>Ok</html>' );
});


process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});


app.listen(process.env.PORT || 80);
console.log("Server running on port 80");
