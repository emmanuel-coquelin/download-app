var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var lister = require('../private/lister.js')

var mongoose = require('mongoose');
var Serie = require('../models/Serie.js')

var router = express.Router();

var logger = require("../private/logger.js")

/* GET users listing. */
router.route('/').get(function (request, response, next) {
    logger.info("Listing all series")

    Serie
        .find()
        .sort({'imdbRating': 1})
        .exec(function (err, series) {
            if (err) return next(err);

            logger.debug('Retrieved ' + series.length + " series")


            response.render('series', {series: series});
        });

}).post(function (request, response, next) {
    logger.debug("Adding series")

    Serie.create(request.body, function (err, post) {
        if (err) return next(err);

        response.json(post);
    });

});

router.route('/name/:name').get(function (request, response, next) {
    logger.debug("Searching for serie " + request.params.name)

    Serie.findByName(request.params.name, function (err, serie) {
        if (err) return next(err);

        response.json(serie)
    })
}).put(function (request, response, next) {
    logger.debug("Updating serie " + request.params.name)

    Serie
        .where('name', request.params.name)
        .findOneAndUpdate(request.body)
        .exec(function (err, serie) {
            if (err) return next(err);

            response.json(serie);
        });

}).delete(function (request, response, next) {
    logger.debug("Deleting serie " + request.params.name)

    Serie
        .remove({name: request.params.name})
        .exec(function (err, serie) {
            if (err) return next(err);

            response.json(serie);
        })
})


router.route('/list').get(function (req, res, next) {

    var url = "http://en.wikipedia.org/wiki/List_of_television_programs_by_name"

    request(url, function (error, response, body) {

        // Error management
        if (error) return next(error);


        var $ = cheerio.load(body);

        var series = [];
        $('li', 'ul').find('i').find('a').each(function (i, elem) {
            Serie.create({name: $(this).text()}, function (err, docs) {
                if (err) {
                    if (err.code != 11000) {
                        logger.debug("exiting with code" + err.code);
                        next(err);
                    }
                }
            })
            series.push(new Serie({'name': $(this).text()}));
        })
        res.end();

    });
});


router.route('/imdb').get(function (req, res, next) {

    logger.debug("Updating all series")
    lister.updateAllSeries();


    logger.debug("Sending response")
    res.send("Series are being loaded into mongoDB  ", 200)

});


module.exports = router;
