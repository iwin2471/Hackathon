var express = require('express');
var router = express.Router();

router.post('/Addgroup', function(req, res) {
    var params = ['query'];
    if (checkParams(req.body, params)) {
        UserGroup.find({
            groupname: req.body.query
        }, function(err, docs) {
            if (docs.length != 0) res.send(docs);
            else res.sendStatus(401);
        })
    } else res.sendStatus(403);
});


function checkParams(body, params) {
    return params.every(str => body[str] != null);
}

module.exports=router;
