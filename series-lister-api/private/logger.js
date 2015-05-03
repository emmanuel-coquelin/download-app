/**
 * Created by ecoquelin on 03/05/15.
 */

var express = require('express');
var bunyan = require('bunyan');
var bunyanLogstashTCP = require('bunyan-logstash-tcp');

var app = express();
var logger;

// if we're in a development environment, then we only log in the console with a DEBUG level
// That's just theorics, for tests purposes, i will alson log to logstash
if (app.get('env') === 'development') {
    logger = bunyan.createLogger({
        name: 'series-lister',
        serializers: bunyan.stdSerializers,
        level : "debug",
        streams: [
            {
                type: 'raw',
                stream: bunyanLogstashTCP.createStream({
                    host: '172.17.1.19',
                    port: 9998
                })
            },
            {
                stream : process.stdout
            }
        ]
    });
}else {
    logger = bunyan.createLogger({
        name: 'series-lister',
        serializers: bunyan.stdSerializers,
        level : "info",
        streams: [
            {
                type: 'raw',
                stream: bunyanLogstashTCP.createStream({
                    host: '172.17.1.19',
                    port: 9998
                })
            },
            {
                stream : process.stdout
            }
        ]
    });
}

module.exports = logger;
