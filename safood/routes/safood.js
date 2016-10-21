var express = require('express');
var router = express.Router();
var randomStr = require("randomstring");

router.post('/Addgroup', function(req, res) {
    var params = ['groupname', 'apikey', "url", "color"];

    if (checkParams(req.body, params)) {
      var newGroup = new SafoodGroup({
          groupname: req.body.groupname,
          groupid: randomStr.generate(),
          color:
          admin: req.body.apikey,
          img_url: req.body.url,
      });

      UserGroup.findOne({groupname: req.body.groupname}, function(err, doc) {
         if(!doc){
           User.update({apikey: req.body.apikey}, {groupid: groupid}, function(err, resul){
             if(err) err;
           });

           newGroup.save(function(err) {
               if (err){
                  res.send(err)
             }else{
                res.send(newGroup);
             }
           });

         }else{
           res.sendStatus(409);
         }
      });
    } else res.sendStatus(403);
});


function checkParams(body, params) {
    return params.every(str => body[str] != null);
}

module.exports=router;
