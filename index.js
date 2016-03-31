var HTMLEncodingConverter = require('./HTMLEncodingConverter.js');
var trumpet = require('trumpet');
var PassThrough = require('stream').PassThrough;

module.exports = HTMLCharsetConverter;

function HTMLCharsetConverter(responseHeader, bufferSize) {

    var htmlEncodingConverter = HTMLEncodingConverter(responseHeader, bufferSize);
    var tr = trumpet();
    
    tr.select('meta', function (elem) {
        elem.getAttribute('http-equiv', function (httpEquiv) {
            if (!httpEquiv) return;
            if (httpEquiv.toLowerCase() === 'content-type') {
                elem.getAttribute('content', function (content) {
                    if (!content) return;
                    var charsetRegex = /(?:charset)\s*=\s*['"]? *([\w\-]+)/i;
                    elem.setAttribute('content', content.replace(charsetRegex, 'UTF-8'));
                });
            }
        });
        elem.getAttribute('charset', function (charset) {
            if (!charset) return;
            elem.setAttribute('charset', 'UTF-8');
        });
    });
    

    var htmlCharsetConverter = new PassThrough();
    htmlCharsetConverter.resume();

    htmlCharsetConverter.on('pipe', function(source) {
        if (source.unpipe) source.unpipe(this);
        this._transformStream = source.pipe(htmlEncodingConverter).pipe(tr);
    });
    
    htmlCharsetConverter.pipe = function(destination, options) {
        return this._transformStream.pipe(destination, options);
    };
    
    return htmlCharsetConverter;
}