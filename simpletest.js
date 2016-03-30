var request = require('request');
var HTMLCharset = require('./index.js');
var http = require('http');

http.createServer(function (cliReq, srvRes) {
    var req = request({
        uri: 'http://koubou.nin29.com/heya/image/2007/test_euc.html',
        gzip: true
    });
    
    srvRes.setHeader('Content-Type', 'text/html');
    req.on('response', function (res) {
        var converter = HTMLCharset(res.headers);
        req.pipe(converter).pipe(srvRes);
    });
     
}).listen(3015);

