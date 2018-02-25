var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PlayerSchema = new Schema(
  {
    name: {type: String, required: true, max: 100},
    plain_name: {type: String, required: true, max: 100},
    club: {type: String, required: true, max: 100},
    pos: {type: String, required: true, max: 10},
    url: {type: String, required: true, max: 200},
    s3url: {type: String, required: true, max: 200},
    age: {type: Number, required: true, max: 100},
    rating: {type: Number, required: true, max: 100}
  }
);

// Virtual for author's full name
PlayerSchema
.virtual('test')
.get(function () {
  return this.test;
});


//Export model
module.exports = mongoose.model('Player', PlayerSchema);