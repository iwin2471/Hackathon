var express = require('express');
var router = express.Router();

router.get('/group/:img', function(req, res) {
    res.sendFile("/node/safood-server/upload/group/" + req.params.img);
});

router.get('/food/:img', function(req, res) {
    res.sendFile("/node/safood-server/upload/food/" + req.params.img);
});

router.get('/user/:img', function(req, res) {
    res.sendFile("/node/safood-server/upload/user/" + req.params.img);
});

module.exports=router;
