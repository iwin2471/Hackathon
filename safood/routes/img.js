var express = require('express');
var router = express.Router();

router.get('/group/:img', function(req, res) {
    res.sendFile("/node/Hackathon/safood/upload/group/"+req.params.img+".png");
});

router.get('/food/:img', function(req, res) {
    res.sendFile("/node/Hackathon/safood/upload/food/"+req.params.img+".png");
});

router.get('/user/:img', function(req, res) {
    res.sendFile("/node/Hackathon/safood/upload/user/"+req.params.img+".png");
});

module.exports=router;
