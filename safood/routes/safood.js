var express = require('express');
var router = express.Router();
var randomStr = require("randomstring");

router.post('/newSafoodGroup', function(req, res) {
    var params = ['groupname', 'apikey', "color"];

    if (checkParams(req.body, params)) {
      var newGroup = new SafoodGroup({
          id: randomStr.generate(),
          name: req.body.groupname,
          color: req.body.color,
          admin: req.body.apikey,
      });

      SafoodGroup.findOne({name: req.body.groupname}, function(err, doc) {
         if(!doc){
           newGroup.save(function(err) {
              if (err){
                  res.send(err)
             }else{
                 SafoodGroup.find({admin: req.body.apikey}, function(err, foods) {
                    res.send(foods);
                 });
             }
           });

         }else{
           res.sendStatus(409);
         }
      });
    } else res.sendStatus(403);
});

router.post('/addToSafoodGroup', function(req, res) {
    var params = ['groupid', 'apikey', "foodid"];
    console.log(req.body.foodid);
    if (checkParams(req.body, params)) {

      SafoodGroup.findOne({groupid: req.body.groupid}, function(err, doc) {
        Food.findOne({foodid: req.body.foodid}, function(err, food){
          SafoodGroup.update({admin: req.body.apikey},{$push: {foodList:{foodName: food.name, img_url: food.thumbnail, foodid: req.body.foodid}}}, function(err, resul) {
            if(err) err;
            else{
              SafoodGroup.find({admin: req.body.apikey}, function(err, group) {
                if(err) err;
                res.status(200).send(group);
              });
            }
          });
        });
      });
    } else res.sendStatus(403);
});


router.post('/removeFromSafoodGroup', function(req, res) {
  var params = ['groupid', 'apikey', "foodid"];

  if (checkParams(req.body, params)) {

    SafoodGroup.findOne({groupid: req.body.groupid}, function(err, doc) {
      Food.findOne({foodid: req.body.foodid}, function(err, food){
        SafoodGroup.update({admin: req.body.apikey},{$pull: {foodList:{foodName: food.name, img_url: food.img_url, foodid: req.body.foodid}}}, function(err, resul) {
          if(err) err;
          else{
            SafoodGroup.find({admin: req.body.apikey}, function(err, group) {
              if(err) err;
              res.status(200).send(group);
            });
          }
        });
      });
    });
  } else res.sendStatus(403);
});

router.post('/getSafoodGroupList', function(req, res) {

   SafoodGroup.find({admin: req.body.apikey}, function(err, groups) {
       res.status(200).send(groups);
   });
});


function checkParams(body, params) {
    return params.every(str => body[str] != null);
}

module.exports=router;
