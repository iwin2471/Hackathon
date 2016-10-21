var express = require('express');
var router = express.Router();
var randomStr = require("randomstring");
var registerParams = ['userid', 'username', 'password'];
var loginParams = ['userid', 'password'];
var autologinParams = ['userid', 'apikey'];

router.post('/login', function(req, res) {
    if (loginParams.every(str => req.body[str] != undefined)) {
        User.findOne({
            userid: req.body.userid
        }, function(err, doc) {
            if (doc != null) {
                if (loginParams.every(str => req.body[str] == doc[str])) {
                    res.send(doc);
                    console.log('User Login : \n' + doc);
                } else res.sendStatus(400);
            } else res.sendStatus(400);
        });
    } else res.sendStatus(403);
});

router.post('/register', function(req, res) {
    if (registerParams.every(str => req.body[str] != undefined || req.body[str] != null)) {
        User.find({
            userid: req.body.userid
        }, function(err, docs) {
            if (err) throw err;
            console.log(docs);
            if (docs.length == 0) {
                var newUser = new User({
                    apikey: randomStr.generate(),
                    groupid: '',
                    profileImage: '',
                    history: [],
                    exception: {
                        religion: [false, false, false, false],
                        allergy: [false, false, false, false, false, false, false, false, false, false],
                        custom: []
                    }
                });
                registerParams.forEach(a => newUser[a] = req.body[a]);
                console.log('User Register : \n' + newUser);
                newUser.save(function(err) {
                    if (err) {
                        throw err;
                    } else res.send(newUser);
                });
            } else res.sendStatus(409);
        });
    } else res.sendStatus(403);
});
router.post('/login/auto', function(req, res) {
    if (autologinParams.every(str => req.body[str] != undefined || req.body[str] != null)) {
        User.findOne({
            userid: req.body.userid,
            apikey: req.body.apikey
        }, function(err, doc) {
            if (doc != null) res.status(200).send(doc);
            else res.sendStatus(401);
        });
    } else res.sendStatus(403);
});

module.exports=router;
