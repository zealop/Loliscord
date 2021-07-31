const PORT = process.env.PORT || 80;

const express = require("express");
const app = express();

const fs = require('fs')
const https = require('https');


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

// var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
// var certificate = fs.readFileSync('sslcert/server.cert', 'utf8');
// var credentials = {key: privateKey, cert: certificate};
// const httpsServer = https.createServer(credentials, app);

app.listen(PORT, function () {
  console.log("Listening on port 80");
});