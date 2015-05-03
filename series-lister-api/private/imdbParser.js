/**
 * Created by Emmanuel on 01/05/2015.
 */

var cheerio = require('cheerio'),
    request = require('request')

// The urll which will be requested
var imdbRoot = "http://www.imdb.com/search/title?sort=user_rating,desc&title_type=tv_series";

/**
 * List 
 * @param nbOfVotes
 * @param callback
 */
exports.listSeries = function(nbOfVotes, callback){

    var nextLink = "/search/title?num_votes=100000,&sort=user_rating,desc&title_type=tv_series";

    var series = []

    async.whilst(function () {
        return nextlink != undefined
    }, function (nextIter) {
        console.log("requesting : " + imdbRoot + nextLink)
        url = imdbRoot + nextLink
        request(url, function (err, resp, body) {
            var $ = cheerio.load(body)
            nextLink = $("div#main div#right span.pagination").first().find("a").filter(function () {
                return $(this).text().match("Next(.*)")
            }).attr("href")

            console.log("next link   is : " + nextLink)
            $("table.results tr.detailed").each(function (i, elem) {
                var serie = {}
                var anchor = $(this).find("td a")
                serie.imdbId = anchor.attr("href").split("/")[2]

                series[series.length] = serie;
            })

            nextIter()
        })
    }, function (err) {
        if(err) return callback(err, null);

        return callback(null, series)
    })
}