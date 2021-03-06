'use strict';
var request = require('request');
var fs = require('fs');
var xml2js = require('xml2js');

module.exports = {
    raw: request,
    get: request.get,

    request: function (url, data, cb) {
        request.post({
            url: url,
            json: true,
            form: data
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                // Return false if succeeded, else true
                cb(false, response, body);
            } else {
                cb(true, response, {
                    message: body
                });
            }
        });
    },

    json: function (url, data, cb) {
        request.post({
            url: url,
            body: data,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                cb(false, response, body);
            } else {
                cb(true, response, {
                    message: body
                });
            }
        });
    },

    xml: function (url, xml, cb) {
        request.post({
            url: url,
            body: xml,
            headers: {
                'Content-Type': 'text/xml'
            }
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                xml2js.parseString(body, {
                    explicitArray: false,
                    ignoreAttrs: true
                }, function (error, json) {
                    if (error) {
                        return cb(true, new Error(body));
                    }
                    cb(false, response, json.xml);
                });
            } else {
                cb(true, response, {
                    message: body
                });
            }
        });
    },

    xmlssl: function (url, xml, ssl, cb) {
        var options = {
            securityOptions: 'SSL_OP_NO_SSLv3'
        };
        if (ssl.pfx && ssl.pfxKey) {
            if (typeof ssl.pfx === 'string') {
                options.pfx = new Buffer(ssl.pfx, 'base64');
            } else {
                options.pfx = ssl.pfx;
            }
            options.passphrase = ssl.pfxKey;
        } else {
            options.pfx = fs.readFileSync(ssl.pfx || ssl.pkcs12);
            options.passphrase = ssl.key;
        }

        request.post({
            url: url,
            body: xml,
            headers: {
                'Content-Type': 'text/xml'
            },
            agentOptions: options
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                xml2js.parseString(body, {
                    explicitArray: false,
                    ignoreAttrs: true
                }, function (error, json) {
                    if (error) {
                        return cb(true, response, new Error(body));
                    }
                    cb(false, response, json.xml);
                });
            } else {
                cb(true, response, {
                    message: body
                });
            }
        });
    },

    file: function (url, file, cb) {
        fs.stat(file, function (err) {
            if (err) {
                return cb(true, {
                    message: 'File not exist!'
                });
            }
            var media = fs.createReadStream(file);

            request.post({
                url: url,
                json: true,
                formData: {
                    media: media,
                    nonce: ''
                }
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    cb(false, body);
                } else {
                    cb(true, {
                        message: body
                    });
                }
            });
        });
    },

    download: function (url, data, file, cb) {
        request.get({
            url: url,
            form: data
        }).pipe(fs.createWriteStream(file).on('finish', cb));
    },
    
    //所有get调用接口方法
    do_get_method: function(url,cb){
        this.get(url, function(err, response, body) {
            if (!err && response.statusCode === 200) {
                var content = JSON.parse(body);
                this.do_result(false, content, cb);
            } else {
                cb(true,null);
            }
        }.bind(this));
    },
    
    //所有post调用接口方法
    do_post_method: function(url,data,cb){
        this.request(url, data, function(err, response, body) {
            if (!err && response.statusCode === 200) {
                this.do_result(false, body, cb);
            } else {
                cb(true,null);
            }
        }.bind(this));
    },
    
    //处理结果
    do_result: function(err,result,cb){
        if (!err) {
            if (result.success) {
                cb(false,result);
            }else {
                cb(true,result);
            }
        }else {
            cb(true,null);
        }
    },
    
};