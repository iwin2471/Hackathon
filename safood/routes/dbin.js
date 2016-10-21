var express = require('express');
var router = express.Router();
var unirest = require('unirest');

router.get('/search/:id', function(req, res) {
    if (get(req.params.id)) {
        res.send("su");
    }
});

function get(id) {
    var materials = "";

    unirest.get('https://apis.eatsight.com/foodinfo/1.0/foods/' + id)
        .headers({
            'Content-Type': 'application/json',
            'DS-ApplicationKey': 'c3a5142c-ad30-4589-b67f-9eac3cdfab6c',
            'DS-AccessToken': '648e4cc5-46a6-4cfb-b3be-95c114232aa5'
        })
        .end(function(res) {
            Food.update({
                foodid: id
            }, {
                barcode: res.body.barcode,
                name: res.body.foodName.replace(/ /gi, '').trim()
            }, function(err, result) {
                if (err) err;
            });
        });

    unirest.get('https://apis.eatsight.com/foodinfo/1.0/foods/' + id + '/materials')
        .headers({
            'Content-Type': 'application/json',
            'DS-ApplicationKey': 'c3a5142c-ad30-4589-b67f-9eac3cdfab6c',
            'DS-AccessToken': '648e4cc5-46a6-4cfb-b3be-95c114232aa5'
        })
        .end(function(res) {
            for (var i = 0; i < res.body.foodMaterials.length; i++) {
                if (i == res.body.foodMaterials.length - 1) {
                    materials += res.body.foodMaterials[i].materialName;
                } else {
                    materials += res.body.foodMaterials[i].materialName + ",";
                }
            }
            Food.update({
                foodid: id
            }, {
                foodIngredient: materials
            }, function(err, result) {
                if (err) err;
            });

            Food.update({
                foodid: id
            }, {
                foodAllergic: res.body.allergyIngredientContent
            }, function(err, result) {
                if (err) err;
            });
        });


    return true;

}

module.exports=router;
