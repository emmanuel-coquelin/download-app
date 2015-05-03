var cheerio = require('cheerio');
var request = require('request');
var async = require("async");
var http = require("http");

var Serie = require('../models/Serie.js')

function updateSeriesDetails(series){

    console.log("imdbId " + series[0].imdbId);
    async.forEach(series, function(serie, callback){
           getOMDBInfos(serie);
        }
    )
}

function getOMDBInfos(serie){
    var omdbapi = "http://www.omdbapi.com/?plot=full&r=json&i="

    var omdbUrl = omdbapi + serie.imdbId.toString();
    console.log("Omdb Url " + omdbUrl);

    request(omdbUrl, function(err, resp, body){
        if(err){
            console.error("Erreur while parsing url" + err)
            console.error("Url was " + omdbUrl)
            return err;
        }


        console.log(body)
        var omdb = JSON.parse(body)
        serie.title = omdb.Title
        serie.description = omdb.Plot
        serie.cover = omdb.Poster
        serie.imdbRating = omdb.imdbRating

        console.log(JSON.stringify(serie, null, 4))

        Serie.update({imdbId : serie.imdbId}, serie, {upsert : true}, function (err, results  ) {
            if(err) console.error(err)
        });
    })
}


exports.updateAllSeries = function(){
    console.log("updateAllSeries entry")

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
        console.error(err)

        updateSeriesDetails(series)
        // res.render("imdb", {json : series.join("\n") });
    })
    console.log("updateAllSeries end")
}