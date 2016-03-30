var request = require('request');
var HTMLCharsetConverter = require('./index.js');
var http = require('http');

http.createServer(function (requ, resp) {
    var req = request({uri: 'http://koubou.nin29.com/heya/image/2007/test_euc.html', gzip: true});
    resp.setHeader('Content-Type', 'text/html');
    req.on('response', function (res) {
        var converter = HTMLCharsetConverter(res.headers);
        req.pipe(converter).pipe(resp);
        converter.on('data', function (data) {
            //console.log(data);
        });
    });
     
}).listen(3015);

