var express = require('express');
var router = express.Router();
var rndStr = require("randomstring");

router.post('/reg', function(req, res, next) {
  var id = req.body.id;
  var pw = req.body.pw;
  var token = rndStr.generate();

  var cun = new Users({
    id: id,
    pw: pw,
    token: token
  });

  cun.save(function(err) {
      if (err) {
          res.sendStatus(409);
      } else{
         res.send(cun);
      }
  });

});

router.post('/login', function(req, res) {
  var id = req.body.id;
  var pw = req.body.pw;

  Users.findOne({id: id, pw: pw}, function (err, users) {
    if(err) return res.sendStatus(409);

    if(users) return res.status(200).send(users);

    else return res.status(400).send("No users");
  })

});


router.post('/auto', function(req, res) {
  var token = req.body.token;

  Users.findOne({token: token}, function(err, users){
    if(err) return res.status(409).send("DB error");

    if(users) return res.status(200).send(users);

    else return res.status(400).send("no user");
  });
});

module.exports = router;
