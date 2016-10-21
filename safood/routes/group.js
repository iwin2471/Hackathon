var express = require('express');
var router = express.Router();
var randomStr = require("randomstring");
var Q = require('q');
var multer = require('multer');

var upload = function(req, res, groupid) {
    var deferred = Q.defer();
    var storage = multer.diskStorage({
        // 서버에 저장할 폴더
        destination: function(req, file, cb) {
            cb(null, "upload/group");
        },

        // 서버에 저장할 파일 명
        filename: function(req, file, cb) {
            file.uploadedFile = {
                name: groupid,
                ext: file.mimetype.split('/')[1]
            };

            cb(null, file.uploadedFile.name + '.' + file.uploadedFile.ext);
        }
    });

    var upload = multer({storage: storage}).single('file');
    upload(req, res, function(err) {
        if (err) {
            deferred.reject();
        } else if (req.file === undefined) {
            User.findOne({apikey: req.body.apikey}, function(err, person) {

              if(person){
                  var newGroup = new UserGroup({
                      groupname: req.body.groupname,
                      groupid: groupid,
                      admin: person.username,
                      limit: req.body.limit,
                      img_url: "defult",
                      members: [
                          person.username
                      ]
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
                }
                });
        } else {
            deferred.resolve(req.file.uploadedFile);
        }
    });
    return deferred.promise;
};



router.post('/searchGroup', function(req, res) {
    var params = ['query'];
    var resul = [];
    if (checkParams(req.body, params)) {
        UserGroup.find({}, function(err, docs) {
            if(err){
               err;
            }else {
              for(var i = 0; i<docs.length; i++){
                if(docs[i].groupname.indexOf(req.body.query) > -1){
                  resul.push(docs[i]);
                }
              }

              res.send(resul);
            }
        })
    } else{
     res.sendStatus(403);}
});

router.post('/getGroupInfo', function(req, res) {
    var params = ['groupid'];

    if (checkParams(req.body, params)) {
        UserGroup.find({groupid: req.body.groupid}, function(err, doc) {
            if (doc.length != 0) res.send(doc);
            else res.sendStatus(401);
        })
    } else res.sendStatus(403);
});

router.post('/joinGroup', function(req, res) {
    var params = ['apikey', 'groupid'];

    if (checkParams(req.body, params)) {
        UserGroup.findOne({
            groupid: req.body.groupid
        }, function(err, doc) {
            if (err) throw err;
            else if (doc != null) {
                if (doc.members.indexOf(req.body.apikey) == -1) {
                    UserGroup.update({
                        groupid: req.body.groupid
                    }, {
                        $push: {
                            members: req.body.apikey
                        }
                    }, function(err, numAff) {
                        if (err) throw err;
                        else if (numAff == 0) res.sendStatus(401);
                        else {
                            User.update({
                                apikey: req.body.apikey
                            }, {
                                groupid: req.body.groupid
                            }, function(err, resual) {
                                if (err) throw err;
                                else res.sendStatus(200);
                            });
                        }
                    });
                } else res.sendStatus(409);
            } else res.sendStatus(401);
        });
    } else res.sendStatus(403);
});

router.post('/leaveGroup', function(req, res) {
    var params = ['apikey', 'groupid'];

    if (checkParams(req.body, params)) {
        UserGroup.findOne({
            groupid: req.body.groupid
        }, function(err, doc) {
            if (err) throw err;
            else if (doc != null) {
                if (doc.members.indexOf(req.body.apikey) > -1) {
                    UserGroup.update({groupid: req.body.groupid}, {pull: {members: req.body.apikey}
                    }, function(err, numAff) {
                        if (err) throw err;
                        else if (numAff == 0) res.sendStatus(401);
                        else res.sendStatus(200);
                    });
                } else res.sendStatus(409);
            } else res.sendStatus(401);
        });
    } else res.sendStatus(403);
});


router.post('/admin/createGroup', function(req, res) {
    var groupid = randomStr.generate();
    apikey = req.body.apikey
        upload(req, res, groupid).then(function(file) {
                User.findOne({apikey: req.body.apikey}, function(err, person) {
                  if(err) err;
                  if(person){
                    var newGroup = new UserGroup({
                        groupname: req.body.groupname,
                        groupid: groupid,
                        admin: person.username,
                        limit: req.body.limit,
                        img_url: "http://iwin247.net:4000/img/group/" + groupid,
                        members: [
                            person.username
                        ]
                    });

                    console.log(groupid);

                    UserGroup.findOne({groupname: req.body.groupname}, function(err, doc) {
                       if(!doc){
                         newGroup.save(function(err) {
                             if (err){
                               res.sendStatus(409);
                             }else{
                               User.update({apikey: req.body.apikey}, {groupid: groupid}, function(err, resul){
                                 if(err) err;
                               });
                               res.send(newGroup);
                             }
                         });

                       }else{
                         res.sendStatus(409);
                       }
                    });

                  }

                })


        }, function(err) {
            if (err) return res.status(408).send(err);
        });
});

router.post('/admin/destroyGroup', function(req, res) {
    var params = ['userid', 'groupid'];

    if (checkParams(req.body, params)) {
        UserGroup.findOne({groupid: req.body.groupid}, function(err, doc) {
            if (doc != null) {
                if (doc.admin == req.body.userid) {
                    UserGroup.remove({
                        groupid: req.body.groupid
                    }, function(err, numAF) {
                        if (err) throw err;
                        else {
                            User.update({
                                groupid: req.body.groupid
                            }, {
                                groupid: ''
                            }, function(err, numAF) {
                                if (err) throw err;
                                else res.sendStatus(200);
                            })
                        }
                    });
                } else res.sendStatus(401);
            } else res.sendStatus(400);
        })
    }
});

router.post('/admin/modifyGroupInfo', function(req, res) {
    var params = ['userid', 'groupname', 'groupid'];
    if (checkParams(req.body, params)) {
        UserGroup.findOne({
            groupid: req.body.groupid
        }, function(err, doc) {
            if (doc != null) {
                if (doc.admin == req.body.userid) {
                    UserGroup.update({
                        groupid: req.body.groupid
                    }, {
                        groupname: req.body.groupname
                    }, function(err, numAF) {
                        if (err) throw err;
                        else res.sendStatus(200);
                    });
                } else res.sendStatus(401);
            } else res.sendStatus(400);
        })
    }
});


router.post('/admin/addUser', function(req, res) {
    var params = ['userid', 'targetid', 'groupid'];
    if (checkParams(req.body, params)) {
        UserGroup.findOne({
            groupid: req.body.groupid
        }, function(err, doc) {
            if (doc != null) {
                if (doc.admin == req.body.userid) {
                    if (doc.members.indexOf(req.body.targetid) == -1) {
                        UserGroup.update({
                            groupid: req.body.groupid
                        }, {
                            $push: {
                                members: req.body.targetid
                            }
                        }, function(err, numAF) {
                            if (err) throw err;
                            else res.sendStatus(200);
                        });
                    } else res.sendStatus(409);
                } else res.sendStatus(401);
            } else res.sendStatus(400);
        })
    }
});

router.post('/admin/removeUser', function(req, res) {
    var params = ['userid', 'targetid', 'groupid'];
    if (checkParams(req.body, params)) {
        UserGroup.findOne({
            groupid: req.body.groupid
        }, function(err, doc) {
            if (doc != null) {
                if (doc.admin == req.body.userid) {
                    if (doc.members.indexOf(req.body.targetid) > -1) {
                        UserGroup.update({
                            groupid: req.body.groupid
                        }, {
                            $pull: {
                                members: req.body.targetid
                            }
                        }, function(err, numAF) {
                            if (err) throw err;
                            else res.sendStatus(200);
                        });
                    } else res.sendStatus(409);
                } else res.sendStatus(401);
            } else res.sendStatus(400);
        })
    }
});


router.post('/admin/removeUser', function(req, res) {
    var params = ['userid', 'targetid', 'groupid'];
    if (checkParams(req.body, params)) {
        UserGroup.findOne({
            groupid: req.body.groupid
        }, function(err, doc) {
            if (doc != null) {
                if (doc.admin == req.body.userid) {
                    if (doc.members.indexOf(req.body.targetid) > -1) {
                        UserGroup.update({
                            groupid: req.body.groupid
                        }, {
                            $pull: {
                                members: req.body.targetid
                            }
                        }, function(err, numAF) {
                            if (err) throw err;
                            else res.sendStatus(200);
                        });
                    } else res.sendStatus(409);
                } else res.sendStatus(401);
            } else res.sendStatus(400);
        })
    }
});


router.post('/memoAdd', function(req, res) {
    var params = ['title', 'content', 'color', 'foods', 'groupid'];

    if (checkParams(req.body, params)) {
        UserGroup.findOne({
            groupid: req.body.groupid
        }, function(err, doc) {
            if (doc != null) {
                UserGroup.update({groupid: req.body.groupid}, {$push: {memo: {title: req.body.title,content: req.body.content,color: req.body.color,foods: req.body.foods.toString().split(',')}}}, function(err, result) {
                    if (err) err;
                    UserGroup.findOne({
                        groupid: req.body.groupid
                    }, function(err, docs) {
                        if (err) err;
                        res.status(200).send(docs.memo);
                    });
                });
            } else res.sendStatus(400);
        })
    }
});


router.post('/memo', function(req, res) {
    var params = ['groupid'];

    if (checkParams(req.body, params)) {
        UserGroup.findOne({
            groupid: req.body.groupid
        }, function(err, doc) {
            if (doc != null) {
                res.status(200).json(doc.memo);
            } else res.sendStatus(400);
        })
    }
});


function checkParams(body, params) {
    return params.every(str => body[str] != null);
}


module.exports=router;
