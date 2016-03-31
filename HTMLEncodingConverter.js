var util = require('util');
var stream = require('stream');
var Transform = stream.Transform;
var charset = require('charset');
var iconv = require('iconv-lite');

util.inherits(HTMLEncodingConverter, Transform);

module.exports = HTMLEncodingConverter;

function HTMLEncodingConverter(responseHeader, bufferSize) {
    if (!(this instanceof HTMLEncodingConverter)) return new HTMLEncodingConverter(responseHeader, bufferSize);

    Transform.call(this);
    
    this._responseHeader = responseHeader;
    this._detectionBufferSize = bufferSize || 512;
    this._detectionBufferArray = [];
    this._bufferTotalLength = 0; 
    this._encoding = null;
    this._detected = false;
    this._converter = null;
    
}

HTMLEncodingConverter.prototype._transform = function(chunk, encoding, callback) {
    var self = this;
    
    if (this._detected) {
        if (this._converter) {
            this._converter.write(chunk);
        } else {
            this.push(chunk);
        }        
    } else {
        this._detectionBufferArray.push(chunk);
        this._bufferTotalLength += chunk.length;
        var buffer = Buffer.concat(this._detectionBufferArray);
        var encoding = charset(this._responseHeader, buffer, this._detectionBufferSize);
        
        if (encoding) {
            var converter = iconv.decodeStream(encoding);
            converter.on('data', function (data) {
                self.push(data);
            });
            converter.write(buffer);
            this._converter = converter;
            this._encoding = encoding;
            this._detected = true;
        } else if (this._bufferTotalLength >= this._detectionBufferSize) {
            this._encoding = null;
            this._detected = true;
            
            this.push(buffer);
        }
    }
    
    callback();
};

HTMLEncodingConverter.prototype._flush = function (callback) {
    var self = this;
    
    if (this._detected){
        if (this._encoding) {
            this._converter.end();
            callback();
        } else {
            callback();
        }
    } else {
        var buffer = Buffer.concat(this._detectionBufferArray);
        var encoding = charset(this._responseHeader, buffer, this._detectionBufferSize);
        
        if (encoding) {
            var converter = iconv.decodeStream(this._encoding); 
            converter.on('data', function (data) {
                self.push(data);
                callback();
            });
            converter.write(buffer);
            converter.end();
            this._converter = converter;
        } else {         
            this.push(buffer);
            callback();
        }
    }
}