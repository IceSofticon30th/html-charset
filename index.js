var HTMLEncodingConverter = require('./HTMLEncodingConverter.js');
var trumpet = require('trumpet');

var util = require('util');
var Transform = require('stream').Transform;

util.inherits(HTMLCharsetConverter, Transform);

function HTMLCharsetConverter(responseHeader, bufferSize) {
    /*
    if (!(this instanceof HTMLCharsetConverter)) return new HTMLCharsetConverter(responseHeader, bufferSize);

    Transform.call(this);
    */
    var self = this;
    
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
    
    /*
    htmlEncodingConverter.on('data', function (data) {
        tr.write(data);
    });
    tr.on('data', function (data) {
        self.push(data);
    });
    */
    
    return htmlEncodingConverter.pipe(tr);
    
    this._htmlEncodingConverter = htmlEncodingConverter;
    this._trumpet = tr;
}

HTMLCharsetConverter.prototype._transform = function (chunk, encoding, callback) {
    this._htmlEncodingConverter.write(chunk);
    callback();
};

HTMLCharsetConverter.prototype._flush = function (callback) {
    this._htmlEncodingConverter.end();
    callback();
};

module.exports = HTMLCharsetConverter;