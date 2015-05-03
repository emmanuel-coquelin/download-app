/**
 * Created by Emmanuel on 24/04/2015.
 */


var mongoose = require("mongoose");
//mongoose.set('debug', true)

var SerieSchema = new mongoose.Schema({
    imdbId : {type: String, index : { unique : true, dropDups : true}},
    title : {type: String},
    description: {type: String},
    cover: {type: String},
    imdbRating: {type: Number},
    nb_episodes: {type: Number}
});

SerieSchema.static('findByName', function (name, callback) {
    return this.find({name: name}, callback);
})

SerieSchema.static('findByNameAndRemove', function (name, callback) {
    return this.findAndModify({name: name}, {}, callback);
})

module.exports = mongoose.model('Serie', SerieSchema);