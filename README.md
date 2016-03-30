# html-charset
A TransformStream that detects charset from http client response and content, and converts HTML to utf-8. Besides, charaset strings in a `<meta>` tag will be replaced to "UTF-8".

# Usage
```js
var HTMLCharset = require('html-charset');
var converter = HTMLCharset(res.headers, 1024);
```
### HTMLCharset(responseHeader[, bufferSize])
* responseHeader {Object | String} Client response. this will be passed to `charset` module.
* bufferSize {number} The maximum size of buffer for detecting charset (Default: 512).  

Returns a new TransformStream that detects charset from http client response and chunked html content, finally converts html content to UTF-8 strings Buffers. First, it stores html contents Buffers as big as bufferSize (default: 512 bytes) and detects charset strings. Then, it converts html contents to UTF-8 strings Buffers. At this time, the charset strings in a `meta` tag is replaced to "UTF-8" (e.g. `<meta http-equiv="Content-Type" content="text/html; charset=EUC_JP">` will be replaced to `<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">`). Finally, you can get UTF-8 html strings Buffers. If the charset couldn't be detected, this stream passes html contents with no modification.

# Example
```js
var request = require('request');
var HTMLCharset = require('html-charset');
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
     
}).listen(8080);
```
`req` writes html contents to `converter`. `converter` receives string/Buffer contents,  detects charset, converts contents to UTF-8 Buffer, replaces charset strings in a `<meta>` tag to `"UTF-8"`, and writes UTF-8 Buffer contents to `srvRes`. `srvRes` receives UTF-8 Buffer contents and sends them to browser.