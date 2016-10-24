var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var apikey;
var id, barcode, name, foodAllergic, thumbnail;

router.post('/barcode', function(req, res) {
    var params = ['apikey', 'barcode'];
    var materials = "";
    apikey = req.body.apikey;

    if (checkParams(req.body, params)){
        User.findOne({apikey: req.body.apikey}, function(err, result) {
            if (err) throw err;
            if (result) {
                Food.findOne({barcode: req.body.barcode}, function(err, food) {
                    if (err) err;
                    if (food) {
                      checkAll(res, result, req.body.barcode, req.body.date);
                    } else {
                        barcode = req.body.barcode;

                        unirest.get('https://apis.eatsight.com/foodinfo/1.0/foods')
                            .headers({
                                'Content-Type': 'application/json',
                                'DS-ApplicationKey': 'c3a5142c-ad30-4589-b67f-9eac3cdfab6c',
                                'DS-AccessToken': '648e4cc5-46a6-4cfb-b3be-95c114232aa5'
                            })
                            .query('foodType=ALL')
                            .query('searchField=barcode')
                            .query('offset=0')
                            .query('limit=1')
                            .query('searchValue=' + req.body.barcode)
                            .end(function(resc) {
                              if(resc.body.items.length == 0){
                                return res.sendStatus(405);
                              }
                                id = resc.body.items[0].foodId;
                                thumbnail = resc.body.items[0].thumbnailUrl;

                                unirest.get('https://apis.eatsight.com/foodinfo/1.0/foods/' + id)
                                    .headers({
                                        'Content-Type': 'application/json',
                                        'DS-ApplicationKey': 'c3a5142c-ad30-4589-b67f-9eac3cdfab6c',
                                        'DS-AccessToken': '648e4cc5-46a6-4cfb-b3be-95c114232aa5'
                                    })
                                    .end(function(resa) {
                                        name = resa.body.foodName.replace(/ /gi, '').trim();
                                        unirest.get('https://apis.eatsight.com/foodinfo/1.0/foods/' + id + '/materials')
                                            .headers({
                                                'Content-Type': 'application/json',
                                                'DS-ApplicationKey': 'c3a5142c-ad30-4589-b67f-9eac3cdfab6c',
                                                'DS-AccessToken': '648e4cc5-46a6-4cfb-b3be-95c114232aa5'
                                            })

                                        .end(function(resb) {
                                            for (var i = 0; i < resb.body.foodMaterials.length; i++) {
                                                if (i == resb.body.foodMaterials.length - 1) {
                                                    materials += resb.body.foodMaterials[i].materialName;
                                                } else {
                                                    materials += resb.body.foodMaterials[i].materialName + ",";
                                                }
                                            }

                                            newFood = new Food({
                                                foodid: id,
                                                barcode: barcode,
                                                name: name,
                                                thumbnail: thumbnail,
                                                foodIngredient: materials,
                                                foodAllergic: resb.body.allergyIngredientContent
                                            });


                                            newFood.save(function(err) {
                                                if (err) {
                                                    throw err;
                                                }
                                            });

                                            User.findOne({apikey: req.body.apikey}, function(err, result) {
                                                if(err) err;
                                                checkAll(res, result, barcode, req.body.date, newFood);
                                            });

                                        });
                                    });
                            });
                    }
                });
            }else{
              res.status(405);
            }
        });

    } else res.status(403).send('Missing Params');
});

router.post('/', function(req, res) {
    var params = ['foodname'];
    var search = [];
    if (checkParams(req.body, params)) {
        Food.find({}, function(err, food) {
            for (var i = 0; i < food.length; i++) {
                if (food[i].name.indexOf(req.body.foodname) > -1) {
                    search.push(food[i]);
                }
            }

            if (search.length > 0) {
                res.status(200).send(search);
            } else {
                res.sendStatus(405)
            }
        });
    }
});


router.post('/foodDic', function(req, res) {
    var params = ['foodname'];
    var search = [];

    if (checkParams(req.body, params)) {
        FoodDic.find({}, function(err, food) {
            for (var i = 0; i < food.length; i++) {
                if (food[i].name.indexOf(req.body.foodname) > -1) {
                    search.push(food[i]);
                }
            }

            if (search.length > 0) {
                res.status(200).send(search);
            } else {
                res.sendStatus(405)
            }
        });
    }
});


function checkParams(body, params) {
    return params.every(str => body[str] != null);
}

function checkAll(res, result, barcode, date, foods){
  var re = ['소고기', '돼지고기'];
  var al = ["계란", "대두", "우유", "밀", "땅콩", "해산물", "과일", "채소", "갑각류", "간장"];
  var real = [];
  var final = [];

  for (var i = 0; i < result.exception.religion.length; i++) {
      if (JSON.parse(result.exception.religion[i])) {
          real.push(re[i]);
      }
  }

  for (var i = 0; i < result.exception.allergy.length; i++) {
      if (JSON.parse(result.exception.allergy[i])) {
          real.push(al[i]);
      }
  }


  if(foods == undefined){
  Food.findOne({barcode: barcode}, function(err, food) {
      if(err) err;
      if (food) {
          for (var i = 0; i < real.length; i++) {
              if (food.foodAllergic.indexOf(real[i]) > -1) {
                  final.push(real[i]);
              }
          }

          User.update({apikey: apikey}, {$push: {history: {foodname: food.name.trim(),date: date}}}, function(err, user) {
              if (err) throw err;
          });

          res.json({
              name: food.name,
              thumbnail: food.thumbnail,
              foodIngredient: food.foodIngredient,
              allergy: final
          });

      }
  });


}else{
  console.log(foods);
  for (var i = 0; i < real.length; i++) {
      if (foods.foodAllergic.indexOf(real[i]) > -1) {
          final.push(real[i]);
      }
  }

  User.update({apikey: apikey}, {$push: {history: {foodname: foods.name.trim(), thumbnail: thumbnail, date: date}}}, function(err, user) {
      if (err) throw err;
  });

  res.json({name: foods.name,thumbnail: foods.thumbnail, foodIngredient: foods.foodIngredient, allergy: final});
}


}

module.exports = router;
