var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  var search = req.body.query;
  var something;

  Schools.find({}, function(err, schools){
    if(err) return res.status(409).send("DB error");

    if(schools){
      for (var i = 0; i < something.length; i++) {
        something[i];
      }
    }else return res.status(400).send("search");
  });
});

module.exports = router;
