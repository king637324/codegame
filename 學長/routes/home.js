var express = require('express');
var router = express.Router();
// var passport = require('passport')
// var LocalStrategy = require('passport-local').Strategy

// var Equipment = require('../models/equipment')
var User = require('../models/user')
var UserSpendTime = require('../models/userspendtime')
var MapRecord = require('../models/map')
var DictionaryRecord = require('../models/dictionary')
var EquipmentRecord = require('../models/equipment')
var GameMapRecord = require('../models/gameMap')
var testDict = require('../models/dataJson/dictionaryJson')
var testEquip = require('../models/dataJson/equipmentJson')

var multer = require("multer");
// 这里dest对应的值是你要将上传的文件存的文件夹
var upload = multer({ dest: '../public/testImg' });

var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var fs = require('fs');

router.post('/onloadImg', function (req, res, next) {

    console.log(req.body.imgName);
    var imgName = req.body.imgName;
    var imgData = req.body.imgData;
    // console.log(imgData);
    // res.json({user:123});
    // //過濾data:URL
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer.from(base64Data, 'base64');
    fs.writeFile("../codegame-/public/img/GameLevel/" + imgName, dataBuffer, function (err) {
        if (err) {
            return res.json({ state: true, err: err });
        } else {
            return res.json({ state: true, path: "GameLevel/" + imgName });
        }
    });
});

router.get('/kuruma', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)
    res.render('home/kuruma', {
        user: req.user.username
    });
});
router.post('/kuruma', function (req, res, next) {
    // Parse Info
    var type = req.body.type
    console.log("home post--------");
    console.log(req.body.type);
    console.log("--------------");
    if (type == "init") {
        var id = req.user.id;
        // console.log(req.user.id);
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            res.json(user);
        })
    }
    /**更新部分 */
    else if (type == "resetEquip") {
        var id = req.user.id;
        User.updateResetEquip(id, function (err, user) {
            if (err) throw err;
            console.log("up   :", user);
            User.getUserById(id, function (err, user) {
                if (err) throw err;
                res.json(user);
            })
        })
    }
    else if (type == "userMap") {
        MapRecord.getMapByUserID(req.user.id, function (err, map) {
            if (err) throw err;
            var dataMap = [];
            for (let indexM = 0; indexM < map.length; indexM++) {
                const element = map[indexM];
                if (element.check == true && element.postStage == 2) {
                    dataMap.push(element);
                }

            }
            res.json(dataMap);
            // console.log(req.user.id);
            // console.log(map);
            // res.json(map);
        })
    }
    /********* */
    else if (type == "weaponLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var weaponLevel = parseInt(user.weaponLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateWeaponLevel(id, weaponLevel, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }
        })
    }
    else if (type == "armorLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var armorLevelup = parseInt(user.armorLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateArmorLevel(id, armorLevelup, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }
        })
    }
    else if (type == "changePassword") {
        var id = req.user.id
        var password = req.body.password
        var oldPassword = req.body.oldPassword
        // console.log(password,oldPassword);

        User.getUserById(id, function (err, user) {
            if (err) throw err;
            if (user) {
                // console.log(user);
                User.comparePassword(oldPassword, user.password, function (err, isMatch) {
                    if (err) throw err
                    if (isMatch) {
                        req.flash('success_msg', 'you are updatePass now')
                        User.updatePassword(user.username, password, function (err, user) {
                            if (err) throw err;
                            // console.log("update :", user);
                        })
                        req.session.updatePassKey = null;
                        return res.json({ responce: 'sucesss' });
                    } else {
                        return res.json({ responce: 'failPassUndifine' });
                    }
                })
            } else {
                return res.json({ responce: 'error' });
            }
        })
        // res.redirect('/login')
    }
    else if (type == "loadDict") {
        DictionaryRecord.getDictionary(function (err, dict) {
            returnData = dict.sort(function (a, b) {
                return a.level > b.level ? 1 : -1;
            });
            res.json(returnData);

        });
    }
    else if (type == "loadEquip") {
        EquipmentRecord.getEquipment(function (err, equip) {
            res.json(equip[0]);

        });
    }
    else if (type == "updateEquip") {
        var seriJson = JSON.parse(req.body.seriJson)
        var armorLevel = seriJson.armorLevel;
        var weaponLevel = seriJson.weaponLevel;
        var levelUpLevel = seriJson.levelUpLevel;
        // console.log(seriJson);
        // console.log(armorLevel,weaponLevel,levelUpLevel);
        EquipmentRecord.updateEquipment(armorLevel, weaponLevel, levelUpLevel, function (err, dictResult) {
            if (err) throw err;
            res.json({ res: true });
        });
    }
    else if (type == "updateDict") {
        var dictType = req.body.dictType
        var dictNum = req.body.dictNum
        var dictValue = req.body.dictValue
        console.log(dictType, dictNum, dictValue);
        DictionaryRecord.getDictionary(function (err, dict) {
            if (err) throw err;
            var typeIndex = 0;
            for (let index = 0; index < dict.length; index++) {
                var element = dict[index];
                if (element.type == dictType) {
                    element.element[dictNum].value = dictValue;
                    typeIndex = index;
                    break;
                    // console.log(element);

                }
            }
            DictionaryRecord.updateDictionaryByType(dict[typeIndex].type, dict[typeIndex].element, function (err, dictResult) {
                if (err) throw err;
                res.json({ res: true });
            });
        });
    }
    else {

    }

});

router.get('/pruss', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)
    res.render('home/pruss', {
        user: req.user.username
    });
});
router.post('/pruss', function (req, res, next) {
    // Parse Info
    var type = req.body.type
    console.log("home post--------");
    console.log(req.body.type);
    console.log("--------------");
    if (type == "init") {
        var id = req.user.id;
        // console.log(req.user.id);
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            res.json(user);
        })
    } else if (type == "loadmusicData") {
        if (req.session.bkMusicVolumn && req.session.musicLevel && req.session.bkMusicSwitch) {
            req.session.bkMusicVolumn = arseInt(req.body.bkMusicVolumn);
            req.session.bkMusicSwitch = parseInt(req.body.bkMusicSwitch);
            req.session.musicLevel = parseInt(req.body.musicLevel);
            console.log("tstt success");
            scriptData = {
                bkMusicVolumn: req.session.bkMusicVolumn
                , bkMusicSwitch: req.session.bkMusicSwitch
                , musicLevel: req.session.musicLevel
            }
            res.json(JSON.stringify(scriptData));
        }
        else {
            console.log("tstt nome");
            scriptData = {
                bkMusicVolumn: 0.1
                , bkMusicSwitch: 1
                , musicLevel: 1
            }
            req.session.bkMusicVolumn = 0.1;
            req.session.bkMusicSwitch = 1;
            req.session.musicLevel = 1;
            res.json(scriptData);

        }

    }
    /**更新部分 */
    else if (type == "resetEquip") {
        var id = req.user.id;
        User.updateResetEquip(id, function (err, user) {
            if (err) throw err;
            console.log("up   :", user);
            User.getUserById(id, function (err, user) {
                if (err) throw err;
                res.json(user);
            })
        })
    }
    else if (type == "userMap") {
        MapRecord.getMapByUserID(req.user.id, function (err, map) {
            if (err) throw err;
            var dataMap = [];
            for (let indexM = 0; indexM < map.length; indexM++) {
                const element = map[indexM];
                if (element.check == true && element.postStage == 2) {
                    dataMap.push(element);
                }

            }
            res.json(dataMap);
            // console.log(req.user.id);
            // console.log(map);
            // res.json(map);
        })
    }
    /********* */
    else if (type == "weaponLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var weaponLevel = parseInt(user.weaponLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateWeaponLevel(id, weaponLevel, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }


        })
    }
    else if (type == "armorLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var armorLevelup = parseInt(user.armorLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateArmorLevel(id, armorLevelup, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }
        })
    }
    else if (type == "changePassword") {
        var id = req.user.id
        var password = req.body.password
        var oldPassword = req.body.oldPassword
        // console.log(password,oldPassword);

        User.getUserById(id, function (err, user) {
            if (err) throw err;
            if (user) {
                // console.log(user);
                User.comparePassword(oldPassword, user.password, function (err, isMatch) {
                    if (err) throw err
                    if (isMatch) {
                        req.flash('success_msg', 'you are updatePass now')
                        User.updatePassword(user.username, password, function (err, user) {
                            if (err) throw err;
                            // console.log("update :", user);
                        })
                        req.session.updatePassKey = null;
                        return res.json({ responce: 'sucesss' });
                    } else {
                        return res.json({ responce: 'failPassUndifine' });
                    }
                })
            } else {
                return res.json({ responce: 'error' });
            }
        })
        // res.redirect('/login')
    }
    else if (type == "loadDict") {
        DictionaryRecord.getDictionary(function (err, dict) {
            returnData = dict.sort(function (a, b) {
                return a.level > b.level ? 1 : -1;
            });
            res.json(returnData);

        });
    }
    else if (type == "loadEquip") {
        EquipmentRecord.getEquipment(function (err, equip) {
            res.json(equip[0]);

        });
    }
    else if (type == "updateEquip") {
        var seriJson = JSON.parse(req.body.seriJson)
        var armorLevel = seriJson.armorLevel;
        var weaponLevel = seriJson.weaponLevel;
        var levelUpLevel = seriJson.levelUpLevel;
        // console.log(seriJson);
        // console.log(armorLevel,weaponLevel,levelUpLevel);
        EquipmentRecord.updateEquipment(armorLevel, weaponLevel, levelUpLevel, function (err, dictResult) {
            if (err) throw err;
            res.json({ res: true });
        });
    }
    else if (type == "updateDict") {
        var dictType = req.body.dictType
        var dictNum = req.body.dictNum
        var dictValue = req.body.dictValue
        console.log(dictType, dictNum, dictValue);
        DictionaryRecord.getDictionary(function (err, dict) {
            if (err) throw err;
            var typeIndex = 0;
            for (let index = 0; index < dict.length; index++) {
                var element = dict[index];
                if (element.type == dictType) {
                    element.element[dictNum].value = dictValue;
                    typeIndex = index;
                    break;
                    // console.log(element);

                }
            }
            DictionaryRecord.updateDictionaryByType(dict[typeIndex].type, dict[typeIndex].element, function (err, dictResult) {
                if (err) throw err;
                res.json({ res: true });
            });
        });
    }
    else {

    }

});

router.get('/gameView_text', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)
    res.render('home/gameView_text', {
        user: req.user.username
    });
});
router.post('/gameView_text', function (req, res, next) {
    // Parse Info
    var type = req.body.type
    console.log("home post--------gameView");
    console.log(req.body.type);
    console.log("--------------");
    if (type == "init") {
        var id = req.user.id;
        bkMusicVolumn = 1;
        bkMusicSwitch = parseInt(req.body.bkMusicSwitch);
        musicLevel = parseInt(req.body.musicLevel);
        if (req.session.bkMusicVolumn) {
            scriptData = {
                bkMusicVolumn: req.session.bkMusicVolumn
                , bkMusicSwitch: req.session.bkMusicSwitch
                , musicLevel: req.session.musicLevel
            }
            res.json(scriptData);
        }

        // console.log(req.user.id);
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            res.json(user);
        })
    }
    else if (type == "weaponLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var weaponLevel = parseInt(user.weaponLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateWeaponLevel(id, weaponLevel, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }


        })
    }
    else if (type == "armorLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var armorLevelup = parseInt(user.armorLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateArmorLevel(id, armorLevelup, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }
        })
    }
    //-----關卡紀錄 ------
    else if (type == "codeLevelResult" || type == "blockLevelResult") {
        console.log("codeLevelResult");
        var id = req.user.id;
        var empire = req.body.Empire
        var data = {
            level: req.body.level,
            HighestStarNum: req.body.StarNum,
            challengeLog: [{
                submitTime: req.body.submitTime,
                result: req.body.result,
                code: req.body.code,
                srarNum: req.body.StarNum,
                instructionNum: req.body.instructionNum
            }]
        }
        console.log("data:", data);

        User.getUserById(id, function (err, user) {
            if (err) throw err;
            if (empire == "EasyEmpire") {
                var EasyEmpire = user.EasyEmpire
                var starChange = false, starChangeNum = 0;
                if (EasyEmpire.codeHighestLevel == data.level && data.HighestStarNum > 0) {
                    EasyEmpire.codeHighestLevel = parseInt(EasyEmpire.codeHighestLevel) + 1;
                    starChange = true;
                    starChangeNum = data.HighestStarNum;
                }
                var codeLevel = EasyEmpire.codeLevel
                var level = false, levelnum = 0;
                for (var i = 0; i < codeLevel.length; i++) {
                    if (codeLevel[i].level == data.level) {
                        level = true;
                        levelnum = i;
                        break;
                    }
                }
                if (level) {
                    if (codeLevel[levelnum].HighestStarNum < data.HighestStarNum) {
                        starChange = true;
                        starChangeNum = data.HighestStarNum - EasyEmpire.codeLevel[levelnum].HighestStarNum;
                        EasyEmpire.codeLevel[levelnum].HighestStarNum = data.HighestStarNum;

                    }
                    EasyEmpire.codeLevel[levelnum].challengeLog.push(data.challengeLog[0]);
                }
                else {
                    EasyEmpire.codeLevel.push(data);
                }
                if (starChange) {
                    var starNum = user.starNum;
                    starNum = parseInt(starNum) + parseInt(starChangeNum);
                    User.updateStarNumById(id, starNum, function (err, level) {
                        if (err) throw err;
                        User.updateEasyEmpireById(id, EasyEmpire, function (err, level) {
                            if (err) throw err;
                            User.getUserById(id, function (err, user) {
                                if (err) throw err;
                                res.json(user);

                            })
                        })
                    })
                }
                else {
                    User.updateEasyEmpireById(id, EasyEmpire, function (err, level) {
                        if (err) throw err;
                        User.getUserById(id, function (err, user) {
                            if (err) throw err;
                            res.json(user);

                        })
                    })
                }
            }
            else if (empire == "MediumEmpire") {
                var MediumEmpire = user.MediumEmpire
                var starChange = false, starChangeNum = 0;
                if ((MediumEmpire.HighestLevel == data.level || MediumEmpire.HighestLevel <= data.level) && data.HighestStarNum > 0) {
                    MediumEmpire.HighestLevel = parseInt(data.level) + 1;
                    starChange = true;
                    starChangeNum = data.HighestStarNum;
                }
                var codeLevel = MediumEmpire.codeLevel
                var level = false, levelnum = 0;
                for (var i = 0; i < codeLevel.length; i++) {
                    if (codeLevel[i].level == data.level) {
                        level = true;
                        levelnum = i;
                        break;
                    }
                }
                if (level) {
                    if (parseInt(codeLevel[levelnum].HighestStarNum) < parseInt(data.HighestStarNum)) {
                        starChange = true;
                        starChangeNum = parseInt(data.HighestStarNum) - parseInt(MediumEmpire.codeLevel[levelnum].HighestStarNum);
                        MediumEmpire.codeLevel[levelnum].HighestStarNum = data.HighestStarNum;

                    }
                    MediumEmpire.codeLevel[levelnum].challengeLog.push(data.challengeLog[0]);
                }
                else {
                    MediumEmpire.codeLevel.push(data);
                }
                console.log(MediumEmpire);
                if (starChange) {
                    var starNum = user.starNum;
                    starNum = parseInt(starNum) + parseInt(starChangeNum);
                    User.updateStarNumById(id, starNum, function (err, level) {
                        if (err) throw err;
                        User.updateMediumEmpireById(id, MediumEmpire, function (err, level) {
                            if (err) throw err;
                            User.getUserById(id, function (err, user) {
                                if (err) throw err;
                                res.json(user);

                            })
                        })
                    })
                }
                else {
                    User.updateMediumEmpireById(id, MediumEmpire, function (err, level) {
                        if (err) throw err;
                        User.getUserById(id, function (err, user) {
                            if (err) throw err;
                            res.json(user);

                        })
                    })
                }



            }
        })
    }
    else if (type == "loadDict") {
        DictionaryRecord.getDictionary(function (err, dict) {
            returnData = dict.sort(function (a, b) {
                return a.level > b.level ? 1 : -1;
            });
            res.json(returnData);

        });
    }
    else if (type == "loadEquip") {
        EquipmentRecord.getEquipment(function (err, equip) {
            res.json(equip[0]);

        });
    }
    else if (type == "updateEquip") {
        var seriJson = JSON.parse(req.body.seriJson)
        var armorLevel = seriJson.armorLevel;
        var weaponLevel = seriJson.weaponLevel;
        var levelUpLevel = seriJson.levelUpLevel;
        // console.log(seriJson);
        // console.log(armorLevel,weaponLevel,levelUpLevel);
        EquipmentRecord.updateEquipment(armorLevel, weaponLevel, levelUpLevel, function (err, dictResult) {
            if (err) throw err;
            res.json({ res: true });
        });
    }
    else if (type == "updateDict") {
        var dictType = req.body.dictType
        var dictNum = req.body.dictNum
        var dictValue = req.body.dictValue
        console.log(dictType, dictNum, dictValue);
        DictionaryRecord.getDictionary(function (err, dict) {
            if (err) throw err;
            var typeIndex = 0;
            for (let index = 0; index < dict.length; index++) {
                var element = dict[index];
                if (element.type == dictType) {
                    element.element[dictNum].value = dictValue;
                    typeIndex = index;
                    break;
                    // console.log(element);

                }
            }
            DictionaryRecord.updateDictionaryByType(dict[typeIndex].type, dict[typeIndex].element, function (err, dictResult) {
                if (err) throw err;
                res.json({ res: true });
            });
        });
    }
    else {

    }

});


router.get('/gameView_blockly', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)
    res.render('home/gameView_blockly', {
        user: req.user.username
    });
});
router.post('/gameView_blockly', function (req, res, next) {
    // Parse Info
    var type = req.body.type
    console.log("home post--------gameView");
    console.log(req.body.type);
    console.log("--------------");
    if (type == "init") {
        var id = req.user.id;
        bkMusicVolumn = 1;
        bkMusicSwitch = parseInt(req.body.bkMusicSwitch);
        musicLevel = parseInt(req.body.musicLevel);
        if (req.session.bkMusicVolumn) {
            scriptData = {
                bkMusicVolumn: req.session.bkMusicVolumn
                , bkMusicSwitch: req.session.bkMusicSwitch
                , musicLevel: req.session.musicLevel
            }
            res.json(scriptData);
        }

        // console.log(req.user.id);
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            res.json(user);
        })
    }
    else if (type == "weaponLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var weaponLevel = parseInt(user.weaponLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateWeaponLevel(id, weaponLevel, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }


        })
    }
    else if (type == "armorLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var armorLevelup = parseInt(user.armorLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateArmorLevel(id, armorLevelup, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }
        })
    }
    //-----暫時的 ------
    //-----關卡紀錄 ------
    else if (type == "blockLevelResult" || type == "codeLevelResult") {
        console.log("codeLevelResult");
        var id = req.user.id;
        var empire = req.body.Empire
        var data = {
            level: req.body.level,
            HighestStarNum: req.body.StarNum,
            challengeLog: [{
                submitTime: req.body.submitTime,
                result: req.body.result,
                code: req.body.code,
                srarNum: req.body.StarNum,
                instructionNum: req.body.instructionNum
            }]
        }
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            if (empire == "EasyEmpire") {
                var EasyEmpire = user.EasyEmpire
                var starChange = false, starChangeNum = 0;
                if (EasyEmpire.codeHighestLevel == data.level && data.HighestStarNum > 0) {
                    EasyEmpire.codeHighestLevel = parseInt(EasyEmpire.codeHighestLevel) + 1;
                    starChange = true;
                    starChangeNum = data.HighestStarNum;
                }
                var codeLevel = EasyEmpire.codeLevel
                var level = false, levelnum = 0;
                for (var i = 0; i < codeLevel.length; i++) {
                    if (codeLevel[i].level == data.level) {
                        level = true;
                        levelnum = i;
                        break;
                    }
                }
                if (level) {
                    if (codeLevel[levelnum].HighestStarNum < data.HighestStarNum) {
                        starChange = true;
                        starChangeNum = data.HighestStarNum - EasyEmpire.codeLevel[levelnum].HighestStarNum;
                        EasyEmpire.codeLevel[levelnum].HighestStarNum = data.HighestStarNum;

                    }
                    EasyEmpire.codeLevel[levelnum].challengeLog.push(data.challengeLog[0]);
                }
                else {
                    EasyEmpire.codeLevel.push(data);
                }
                if (starChange) {
                    var starNum = user.starNum;
                    starNum = parseInt(starNum) + parseInt(starChangeNum);
                    User.updateStarNumById(id, starNum, function (err, level) {
                        if (err) throw err;
                        User.updateEasyEmpireById(id, EasyEmpire, function (err, level) {
                            if (err) throw err;
                            User.getUserById(id, function (err, user) {
                                if (err) throw err;
                                res.json(user);

                            })
                        })
                    })
                }
                else {
                    User.updateEasyEmpireById(id, EasyEmpire, function (err, level) {
                        if (err) throw err;
                        User.getUserById(id, function (err, user) {
                            if (err) throw err;
                            res.json(user);

                        })
                    })
                }
            }
            else if (empire == "MediumEmpire") {
                var MediumEmpire = user.MediumEmpire
                var starChange = false, starChangeNum = 0;
                if (MediumEmpire.HighestLevel == data.level && data.HighestStarNum > 0) {
                    MediumEmpire.HighestLevel = parseInt(MediumEmpire.HighestLevel) + 1;
                    starChange = true;
                    starChangeNum = data.HighestStarNum;
                }
                var codeLevel = MediumEmpire.codeLevel
                var level = false, levelnum = 0;
                for (var i = 0; i < codeLevel.length; i++) {
                    if (codeLevel[i].level == data.level) {
                        level = true;
                        levelnum = i;
                        break;
                    }
                }
                if (level) {
                    if (parseInt(codeLevel[levelnum].HighestStarNum) < parseInt(data.HighestStarNum)) {
                        starChange = true;
                        starChangeNum = parseInt(data.HighestStarNum) - parseInt(MediumEmpire.codeLevel[levelnum].HighestStarNum);
                        MediumEmpire.codeLevel[levelnum].HighestStarNum = data.HighestStarNum;

                    }
                    MediumEmpire.codeLevel[levelnum].challengeLog.push(data.challengeLog[0]);
                }
                else {
                    MediumEmpire.codeLevel.push(data);
                }
                console.log(MediumEmpire);
                if (starChange) {
                    var starNum = user.starNum;
                    starNum = parseInt(starNum) + parseInt(starChangeNum);
                    User.updateStarNumById(id, starNum, function (err, level) {
                        if (err) throw err;
                        User.updateMediumEmpireById(id, MediumEmpire, function (err, level) {
                            if (err) throw err;
                            User.getUserById(id, function (err, user) {
                                if (err) throw err;
                                res.json(user);

                            })
                        })
                    })
                }
                else {
                    User.updateMediumEmpireById(id, MediumEmpire, function (err, level) {
                        if (err) throw err;
                        User.getUserById(id, function (err, user) {
                            if (err) throw err;
                            res.json(user);

                        })
                    })
                }



            }
        })
    }
    //-------------------
    else if (type == "loadDict") {
        DictionaryRecord.getDictionary(function (err, dict) {
            returnData = dict.sort(function (a, b) {
                return a.level > b.level ? 1 : -1;
            });
            res.json(returnData);

        });
    }
    else if (type == "loadEquip") {
        EquipmentRecord.getEquipment(function (err, equip) {
            res.json(equip[0]);

        });
    }
    else if (type == "updateEquip") {
        var seriJson = JSON.parse(req.body.seriJson)
        var armorLevel = seriJson.armorLevel;
        var weaponLevel = seriJson.weaponLevel;
        var levelUpLevel = seriJson.levelUpLevel;
        // console.log(seriJson);
        // console.log(armorLevel,weaponLevel,levelUpLevel);
        EquipmentRecord.updateEquipment(armorLevel, weaponLevel, levelUpLevel, function (err, dictResult) {
            if (err) throw err;
            res.json({ res: true });
        });
    }
    else {

    }

});

router.get('/managementModifyMap', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)
    res.render('backstage/managementModifyMap', {
        user: req.user.username
    });
});
router.post('/managementModifyMap', function (req, res, next) {
    // Parse Info
    var type = req.body.type
    console.log("home post--------gameView");
    console.log(req.body.type);
    console.log("--------------");
    if (type == "init") {
        var id = req.user.id;
        bkMusicVolumn = 1;
        bkMusicSwitch = parseInt(req.body.bkMusicSwitch);
        musicLevel = parseInt(req.body.musicLevel);
        if (req.session.bkMusicVolumn) {
            scriptData = {
                bkMusicVolumn: req.session.bkMusicVolumn
                , bkMusicSwitch: req.session.bkMusicSwitch
                , musicLevel: req.session.musicLevel
            }
            res.json(scriptData);
        }

        // console.log(req.user.id);
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            res.json(user);
        })
    }
    else if (type == "weaponLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var weaponLevel = parseInt(user.weaponLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateWeaponLevel(id, weaponLevel, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }


        })
    }
    else if (type == "armorLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var armorLevelup = parseInt(user.armorLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateArmorLevel(id, armorLevelup, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }
        })
    }
    //-----暫時的 ------
    //-----關卡紀錄 ------
    else if (type == "blockLevelResult" || type == "codeLevelResult") {
        console.log("codeLevelResult");
        var id = req.user.id;
        var empire = req.body.Empire
        var data = {
            level: req.body.level,
            HighestStarNum: req.body.StarNum,
            challengeLog: [{
                submitTime: req.body.submitTime,
                result: req.body.result,
                code: req.body.code,
                srarNum: req.body.StarNum,
                instructionNum: req.body.instructionNum
            }]
        }
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            if (empire == "EasyEmpire") {
                var EasyEmpire = user.EasyEmpire
                var starChange = false, starChangeNum = 0;
                if (EasyEmpire.codeHighestLevel == data.level && data.HighestStarNum > 0) {
                    EasyEmpire.codeHighestLevel = parseInt(EasyEmpire.codeHighestLevel) + 1;
                    starChange = true;
                    starChangeNum = data.HighestStarNum;
                }
                var codeLevel = EasyEmpire.codeLevel
                var level = false, levelnum = 0;
                for (var i = 0; i < codeLevel.length; i++) {
                    if (codeLevel[i].level == data.level) {
                        level = true;
                        levelnum = i;
                        break;
                    }
                }
                if (level) {
                    if (codeLevel[levelnum].HighestStarNum < data.HighestStarNum) {
                        starChange = true;
                        starChangeNum = data.HighestStarNum - EasyEmpire.codeLevel[levelnum].HighestStarNum;
                        EasyEmpire.codeLevel[levelnum].HighestStarNum = data.HighestStarNum;

                    }
                    EasyEmpire.codeLevel[levelnum].challengeLog.push(data.challengeLog[0]);
                }
                else {
                    EasyEmpire.codeLevel.push(data);
                }
                if (starChange) {
                    var starNum = user.starNum;
                    starNum = parseInt(starNum) + parseInt(starChangeNum);
                    User.updateStarNumById(id, starNum, function (err, level) {
                        if (err) throw err;
                        User.updateEasyEmpireById(id, EasyEmpire, function (err, level) {
                            if (err) throw err;
                            User.getUserById(id, function (err, user) {
                                if (err) throw err;
                                res.json(user);

                            })
                        })
                    })
                }
                else {
                    User.updateEasyEmpireById(id, EasyEmpire, function (err, level) {
                        if (err) throw err;
                        User.getUserById(id, function (err, user) {
                            if (err) throw err;
                            res.json(user);

                        })
                    })
                }
            }
            else if (empire == "MediumEmpire") {
                var MediumEmpire = user.MediumEmpire
                var starChange = false, starChangeNum = 0;
                if (MediumEmpire.HighestLevel == data.level && data.HighestStarNum > 0) {
                    MediumEmpire.HighestLevel = parseInt(MediumEmpire.HighestLevel) + 1;
                    starChange = true;
                    starChangeNum = data.HighestStarNum;
                }
                var codeLevel = MediumEmpire.codeLevel
                var level = false, levelnum = 0;
                for (var i = 0; i < codeLevel.length; i++) {
                    if (codeLevel[i].level == data.level) {
                        level = true;
                        levelnum = i;
                        break;
                    }
                }
                if (level) {
                    if (parseInt(codeLevel[levelnum].HighestStarNum) < parseInt(data.HighestStarNum)) {
                        starChange = true;
                        starChangeNum = parseInt(data.HighestStarNum) - parseInt(MediumEmpire.codeLevel[levelnum].HighestStarNum);
                        MediumEmpire.codeLevel[levelnum].HighestStarNum = data.HighestStarNum;

                    }
                    MediumEmpire.codeLevel[levelnum].challengeLog.push(data.challengeLog[0]);
                }
                else {
                    MediumEmpire.codeLevel.push(data);
                }
                console.log(MediumEmpire);
                if (starChange) {
                    var starNum = user.starNum;
                    starNum = parseInt(starNum) + parseInt(starChangeNum);
                    User.updateStarNumById(id, starNum, function (err, level) {
                        if (err) throw err;
                        User.updateMediumEmpireById(id, MediumEmpire, function (err, level) {
                            if (err) throw err;
                            User.getUserById(id, function (err, user) {
                                if (err) throw err;
                                res.json(user);

                            })
                        })
                    })
                }
                else {
                    User.updateMediumEmpireById(id, MediumEmpire, function (err, level) {
                        if (err) throw err;
                        User.getUserById(id, function (err, user) {
                            if (err) throw err;
                            res.json(user);

                        })
                    })
                }



            }
        })
    }
    //-------------------
    else {

    }

});

/*以下測試檔*/
router.get('/managementModifyMapTest', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)
    res.render('backstage/managementModifyMapTest', {
        user: req.user.username
    });
});
router.post('/managementModifyMapTest', function (req, res, next) {
    // Parse Info
    var type = req.body.type
    console.log("home post--------gameView");
    console.log(req.body.type);
    console.log("--------------");
    if (type == "init") {
        var id = req.user.id;
        bkMusicVolumn = 1;
        bkMusicSwitch = parseInt(req.body.bkMusicSwitch);
        musicLevel = parseInt(req.body.musicLevel);
        if (req.session.bkMusicVolumn) {
            scriptData = {
                bkMusicVolumn: req.session.bkMusicVolumn
                , bkMusicSwitch: req.session.bkMusicSwitch
                , musicLevel: req.session.musicLevel
            }
            res.json(scriptData);
        }

        // console.log(req.user.id);
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            res.json(user);
        })
    }
    else if (type == "weaponLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var weaponLevel = parseInt(user.weaponLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateWeaponLevel(id, weaponLevel, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }


        })
    }
    else if (type == "armorLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var armorLevelup = parseInt(user.armorLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateArmorLevel(id, armorLevelup, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }
        })
    }
    //-----暫時的 ------
    //-----關卡紀錄 ------
    else if (type == "blockLevelResult" || type == "codeLevelResult") {
        console.log("codeLevelResult");
        var id = req.user.id;
        var empire = req.body.Empire
        var data = {
            level: req.body.level,
            HighestStarNum: req.body.StarNum,
            challengeLog: [{
                submitTime: req.body.submitTime,
                result: req.body.result,
                code: req.body.code,
                srarNum: req.body.StarNum,
                instructionNum: req.body.instructionNum
            }]
        }
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            if (empire == "EasyEmpire") {
                var EasyEmpire = user.EasyEmpire
                var starChange = false, starChangeNum = 0;
                if (EasyEmpire.codeHighestLevel == data.level && data.HighestStarNum > 0) {
                    EasyEmpire.codeHighestLevel = parseInt(EasyEmpire.codeHighestLevel) + 1;
                    starChange = true;
                    starChangeNum = data.HighestStarNum;
                }
                var codeLevel = EasyEmpire.codeLevel
                var level = false, levelnum = 0;
                for (var i = 0; i < codeLevel.length; i++) {
                    if (codeLevel[i].level == data.level) {
                        level = true;
                        levelnum = i;
                        break;
                    }
                }
                if (level) {
                    if (codeLevel[levelnum].HighestStarNum < data.HighestStarNum) {
                        starChange = true;
                        starChangeNum = data.HighestStarNum - EasyEmpire.codeLevel[levelnum].HighestStarNum;
                        EasyEmpire.codeLevel[levelnum].HighestStarNum = data.HighestStarNum;

                    }
                    EasyEmpire.codeLevel[levelnum].challengeLog.push(data.challengeLog[0]);
                }
                else {
                    EasyEmpire.codeLevel.push(data);
                }
                if (starChange) {
                    var starNum = user.starNum;
                    starNum = parseInt(starNum) + parseInt(starChangeNum);
                    User.updateStarNumById(id, starNum, function (err, level) {
                        if (err) throw err;
                        User.updateEasyEmpireById(id, EasyEmpire, function (err, level) {
                            if (err) throw err;
                            User.getUserById(id, function (err, user) {
                                if (err) throw err;
                                res.json(user);

                            })
                        })
                    })
                }
                else {
                    User.updateEasyEmpireById(id, EasyEmpire, function (err, level) {
                        if (err) throw err;
                        User.getUserById(id, function (err, user) {
                            if (err) throw err;
                            res.json(user);

                        })
                    })
                }
            }
            else if (empire == "MediumEmpire") {
                var MediumEmpire = user.MediumEmpire
                var starChange = false, starChangeNum = 0;
                if (MediumEmpire.HighestLevel == data.level && data.HighestStarNum > 0) {
                    MediumEmpire.HighestLevel = parseInt(MediumEmpire.HighestLevel) + 1;
                    starChange = true;
                    starChangeNum = data.HighestStarNum;
                }
                var codeLevel = MediumEmpire.codeLevel
                var level = false, levelnum = 0;
                for (var i = 0; i < codeLevel.length; i++) {
                    if (codeLevel[i].level == data.level) {
                        level = true;
                        levelnum = i;
                        break;
                    }
                }
                if (level) {
                    if (parseInt(codeLevel[levelnum].HighestStarNum) < parseInt(data.HighestStarNum)) {
                        starChange = true;
                        starChangeNum = parseInt(data.HighestStarNum) - parseInt(MediumEmpire.codeLevel[levelnum].HighestStarNum);
                        MediumEmpire.codeLevel[levelnum].HighestStarNum = data.HighestStarNum;

                    }
                    MediumEmpire.codeLevel[levelnum].challengeLog.push(data.challengeLog[0]);
                }
                else {
                    MediumEmpire.codeLevel.push(data);
                }
                console.log(MediumEmpire);
                if (starChange) {
                    var starNum = user.starNum;
                    starNum = parseInt(starNum) + parseInt(starChangeNum);
                    User.updateStarNumById(id, starNum, function (err, level) {
                        if (err) throw err;
                        User.updateMediumEmpireById(id, MediumEmpire, function (err, level) {
                            if (err) throw err;
                            User.getUserById(id, function (err, user) {
                                if (err) throw err;
                                res.json(user);

                            })
                        })
                    })
                }
                else {
                    User.updateMediumEmpireById(id, MediumEmpire, function (err, level) {
                        if (err) throw err;
                        User.getUserById(id, function (err, user) {
                            if (err) throw err;
                            res.json(user);

                        })
                    })
                }



            }
        })
    }
    //-------------------
    else {

    }

});
/*到此結束*/

router.get('/managementUser', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)
    if (!(req.user.username == "NKUSTCCEA"||req.user.username == "teacher")) { //如有其他管理者 在這加
        res.redirect('/login')
    }
    res.render('backstage/managementUser', {
        user: req.user.username
    });
});
router.post('/managementUser', function (req, res, next) {
    // Parse Info
    var type = req.body.type
    console.log("home post--------");
    console.log(req.body.type);
    console.log("--------------");
    if (type == "init") {
        var id = req.user.id;
        // console.log(req.user.id);
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            res.json(user);
        })
    }
    else if (type == "LoadUser") {
        User.getUser(req.user.id, function (err, users) {
            if (err) throw err;
            res.json(users);
        })
    }
    else if (type == "changeUserStatus") {
        var userstatus = req.body.userstatus;
        var userId = req.body.userId;
        User.updateUserStatus(userId, userstatus, function (err, users) {
            if (err) throw err;
            res.json(users);
        })
    }

});
// 以下宜靜 2020.04.14
router.get('/managementRFMP', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)
    if (!(req.user.username == "NKUSTCCEA"||req.user.username == "teacher")) { //如有其他管理者 在這加
        res.redirect('/login')
    }
    res.render('backstage/managementRFMP', {
        user: req.user.username
    });
});

router.post('/managementRFMP', function (req, res, next) {
    var UserRFMP = []; // 陣列裡中每一筆資料存 [玩家信箱,R數據,F數據,M數據,P數據,R評分,F評分,M評分,P評分,R值,F值,M值,P值,學習者類型]
                                           // [   0   ,  1  ,  2  ,  3  , 4  ,  5  ,  6  , 7  ,  8  , 9 , 10, 11, 12,    13   ]
    var RQ = [0,0,0,0],FQ = [0,0,0,0],MQ = [0,0,0,0], PQ = [0,0,0,0];
    var Rave = 0,Fave = 0,Mave = 0,Fave = 0;
    var Rday = new Date().getTime();
    
    User.getAllUser(function (err, userState){
        if (err) throw err;
        console.log("玩家人數:",userState.length);
        var userlen = 0;    // 判斷玩家人數，因要扣除管理者

        // 初始化所有玩家RFMP陣列資料
        for(let index = 0;index < userState.length; index++){
            if( userState[index].email != "NKUSTCCEA@gmail.com" ){
                UserRFMP[userlen] = [userState[index].email,0,0,0,0,0,0,0,0,0,0,0,0,""];
                userlen = userlen + 1;
            }
        }// 結束初始化所有玩家RFMP陣列資料

        // R & F數據計算
        for(let index = 0;index < userState.length; index++){
            if(userState[index].Logintime.length){    // 如果userState[index]此玩家有登入資料
                for(let i=0; i < UserRFMP.length; i++){
                    if(userState[index].email == UserRFMP[i][0]){
                        var Login = userState[index].Logintime.length;
                        var Rsub = (Rday - userState[index].Logintime[Login-1].getTime()) / 1000 / 60 / 60 / 24;  //換算成天 
                        UserRFMP[i][1] = Rsub;// UserRFMP[i][1] 存 Rdata
                        UserRFMP[i][2] = Login;  // UserRFMP[i][2] 存 Fdata
                    }
                }
            }
        } // 結束 R & F 數據計算

        // R數據由小排到大
        let Rtime = UserRFMP.length;
        while(Rtime > 1){
            Rtime--;
            for(let i=0; i < UserRFMP.length-1;i++){
                var temp;
                if( UserRFMP[i][1] > UserRFMP[i+1][1] ){
                    temp = UserRFMP[i];
                    UserRFMP[i] = UserRFMP[i+1];
                    UserRFMP[i+1] = temp;
                }
            }
        } 

        // R數據的五分位數計算
        for(let i = 0; i < RQ.length; i++){
            if(i==3){   //取 80%  為 Q4
                var position = UserRFMP.length*0.2;
                if ((position % 1) == 0) {
                    RQ[i] = (UserRFMP[Math.floor(position)][1] + UserRFMP[Math.floor(position)+1][1])/2;
                }else{
                    RQ[i] = UserRFMP[Math.floor(position)][1]; //整數無條件進位
                }
            }
            if(i==2){   //取 60%  為 Q3
                var position = UserRFMP.length*0.4;
                if ((position % 1) == 0) {
                    RQ[i] = (UserRFMP[Math.floor(position)][1] + UserRFMP[Math.floor(position)+1][1])/2;
                }else{
                    RQ[i] = UserRFMP[Math.floor(position)][1]; //整數無條件進位
                }
            }
            if(i==1){   //取 40%  為 Q2
                var position = UserRFMP.length*0.6;
                if ((position % 1) == 0) {
                    RQ[i] = (UserRFMP[Math.floor(position)][1] + UserRFMP[Math.floor(position)+1][1])/2;
                }else{
                    RQ[i] = UserRFMP[Math.floor(position)][1]; //整數無條件進位
                }
            }
            if(i==0){   //取 20%  為 Q1
                var position = UserRFMP.length*0.8;
                if ((position % 1) == 0) {
                    RQ[i] = (UserRFMP[Math.floor(position)][1] + UserRFMP[Math.floor(position)+1][1])/2;
                }else{
                    RQ[i] = UserRFMP[Math.floor(position)][1]; //整數無條件進位
                }
            }
        }
        console.log("RQ:",RQ);
        // 結束 R數據的五分位數計算

        // 玩家R評分計算
        for(let index = 0; index < UserRFMP.length; index++){
            if(UserRFMP[index][1] <= RQ[3]){  // 如果大於等於RQ4，得5分
                UserRFMP[index][5] = 5;
            }else if((UserRFMP[index][1] > RQ[3]) && (UserRFMP[index][1] <= RQ[2])){  // 如果小於RQ4，且大於等於RQ3，得4分
                UserRFMP[index][5] = 4;
            }else if((UserRFMP[index][1] > RQ[2]) && (UserRFMP[index][1] <= RQ[1])){  // 如果小於RQ3，且大於等於RQ2，得3分
                UserRFMP[index][5] = 3;
            }else if((UserRFMP[index][1] > RQ[1]) && (UserRFMP[index][1] <= RQ[0])){  // 如果小於RQ2，且大於等於RQ1，得2分
                UserRFMP[index][5] = 2;
            }else{  // 如果小於等於MQ1，得1分
                UserRFMP[index][5] = 1;
            }
        } // 結束 玩家R評分計算

        for(let i=0;i < UserRFMP.length; i++){
            Rave = Rave + UserRFMP[i][1];
        }
        console.log("R評分總分數:",Rave);
        Rave = Rave / UserRFMP.length;
        console.log("R評分平均:",Rave);

        // // 更新使用者Rscore
        // for(let i=0;i < UserRFMP.length; i++){
        //     User.updateRscore(UserRFMP[i][0], UserRFMP[i][1] ,function (err, record) {
        //         if (err) throw err;
        //    })
        // }

        // F數據由大排到小
        let Ftime = UserRFMP.length;
        while(Ftime > 1){
            Ftime--;
            for(let i=0; i < UserRFMP.length-1;i++){
                var temp;
                if( UserRFMP[i][2] < UserRFMP[i+1][2] ){
                    temp = UserRFMP[i];
                    UserRFMP[i] = UserRFMP[i+1];
                    UserRFMP[i+1] = temp;
                }
            }
        }  

        // F數據的五分位數計算
        for(let i = 0; i < FQ.length; i++){
            if(i==3){   //取 80%  為 Q4
                var position = UserRFMP.length*0.2;
                if ((position % 1) == 0) {
                    FQ[i] = (UserRFMP[Math.floor(position)][2] + UserRFMP[Math.floor(position)+1][2])/2;
                }else{
                    FQ[i] = UserRFMP[Math.floor(position)][2]; //整數無條件進位
                }
            }
            if(i==2){   //取 60%  為 Q3
                var position = UserRFMP.length*0.4;
                if ((position % 1) == 0) {
                    FQ[i] = (UserRFMP[Math.floor(position)][2] + UserRFMP[Math.floor(position)+1][2])/2;
                }else{
                    FQ[i] = UserRFMP[Math.floor(position)][2]; //整數無條件進位
                }
            }
            if(i==1){   //取 40%  為 Q2
                var position = UserRFMP.length*0.6;
                if ((position % 1) == 0) {
                    FQ[i] = (UserRFMP[Math.floor(position)][2] + UserRFMP[Math.floor(position)+1][2])/2;
                }else{
                    FQ[i] = UserRFMP[Math.floor(position)][2]; //整數無條件進位
                }
            }
            if(i==0){   //取 20%  為 Q1
                var position = UserRFMP.length*0.8;
                if ((position % 1) == 0) {
                    FQ[i] = (UserRFMP[Math.floor(position)][2] + UserRFMP[Math.floor(position)+1][2])/2;
                }else{
                    FQ[i] = UserRFMP[Math.floor(position)][2]; //整數無條件進位
                }
            }
        }
        console.log("FQ:",FQ);
        // 結束 F數據的五分位數計算

        // 玩家F評分計算
        for(let index = 0; index < UserRFMP.length; index++){
            if(UserRFMP[index][2] >= FQ[3]){  // 如果大於等於FQ4，得5分
                UserRFMP[index][6] = 5;
            }else if((UserRFMP[index][2] < FQ[3]) && (UserRFMP[index][2] >= FQ[2])){  // 如果小於FQ4，且大於等於FQ3，得4分
                UserRFMP[index][6] = 4;
            }else if((UserRFMP[index][2] < FQ[2]) && (UserRFMP[index][2] >= FQ[1])){  // 如果小於FQ3，且大於等於FQ2，得3分
                UserRFMP[index][6] = 3;
            }else if((UserRFMP[index][2] < FQ[1]) && (UserRFMP[index][2] >= FQ[0])){  // 如果小於FQ2，且大於等於FQ1，得2分
                UserRFMP[index][6] = 2;
            }else{  // 如果小於等於FQ1，得1分
                UserRFMP[index][5] = 1;
            }
        } // 結束 玩家F評分計算

        for(let i=0;i < UserRFMP.length; i++){
            Fave = Fave + UserRFMP[i][6];
        }
        console.log("F評分總分數:",Fave);
        Fave = Fave / UserRFMP.length;
        console.log("F評分平均:",Fave);

        // // 更新使用者Fscore
        // for(let i=0;i < UserRFMP.length; i++){
        //     User.updateFscore(UserRFMP[i][0], UserRFMP[i][6] ,function (err, record) {
        //         if (err) throw err;
        //    })
        // }

        // 以下做 M & P的計算
        UserSpendTime.getAllUserSpendTimeState(function (err, userSpendTimeState){
            if (err) throw err;
    
            // M & P數據計算
            for(let index = 0;index < userSpendTimeState.length ;index++){
                const MP_process = userSpendTimeState[index];
                var min = (MP_process.endplay.getTime() - MP_process.startplay.getTime()) / 1000 / 60;  //換算成分鐘
                var check = true;
                for(let index = 0;index < UserRFMP.length ; index++){
                    if(MP_process.email == UserRFMP[index][0]){
                        UserRFMP[index][3] = UserRFMP[index][3] + min;  // UserRFMP[index][3] 存 Mdata
                        UserRFMP[index][4] = UserRFMP[index][4] + MP_process.starNumber;  // UserRFMP[index][4] 存 Pdata
                        check = false;
                    }
                }
                if(check){
                    UserRFMP[UserRFMP.length] = [,,,min,MP_process.starNumber];
                }   
            } // 結束M & P數據計算
            
    
            // M數據由大排到小
            let Mtime = UserRFMP.length;
            while(Mtime > 1){
                Mtime--;
                for(let i=0; i < UserRFMP.length-1;i++){
                    var temp;
                    if( UserRFMP[i][3] < UserRFMP[i+1][3] ){
                        temp = UserRFMP[i];
                        UserRFMP[i] = UserRFMP[i+1];
                        UserRFMP[i+1] = temp;
                    }
                }
            }   
    
            // M數據的五分位數計算
            for(let i = 0; i < MQ.length; i++){
                if(i==3){   //取 80%  為 Q4
                    var position = UserRFMP.length*0.2;
                    if ((position % 1) == 0) {
                        MQ[i] = (UserRFMP[Math.floor(position)][3] + UserRFMP[Math.floor(position)+1][3])/2;
                    }else{
                        MQ[i] = UserRFMP[Math.floor(position)][3]; //整數無條件進位
                    }
                }
                if(i==2){   //取 60%  為 Q3
                    var position = UserRFMP.length*0.4;
                    if ((position % 1) == 0) {
                        MQ[i] = (UserRFMP[Math.floor(position)][3] + UserRFMP[Math.floor(position)+1][3])/2;
                    }else{
                        MQ[i] = UserRFMP[Math.floor(position)][3]; //整數無條件進位
                    }
                }
                if(i==1){   //取 40%  為 Q2
                    var position = UserRFMP.length*0.6;
                    if ((position % 1) == 0) {
                        MQ[i] = (UserRFMP[Math.floor(position)][3] + UserRFMP[Math.floor(position)+1][3])/2;
                    }else{
                        MQ[i] = UserRFMP[Math.floor(position)][3]; //整數無條件進位
                    }
                }
                if(i==0){   //取 20%  為 Q1
                    var position = UserRFMP.length*0.8;
                    if ((position % 1) == 0) {
                        MQ[i] = (UserRFMP[Math.floor(position)][3] + UserRFMP[Math.floor(position)+1][3])/2;
                    }else{
                        MQ[i] = UserRFMP[Math.floor(position)][3]; //整數無條件進位
                    }
                }
            }
            console.log("MQ:",MQ);
            // 結束 M數據的五分位數計算
    
            // 玩家M評分計算
            for(let index = 0; index < UserRFMP.length; index++){
                if(UserRFMP[index][3] >= MQ[3]){  // 如果大於等於MQ4，得5分
                    UserRFMP[index][7] = 5;
                }else if((UserRFMP[index][3] < MQ[3]) && (UserRFMP[index][3] >= MQ[2])){  // 如果小於MQ4，且大於等於MQ3，得4分
                    UserRFMP[index][7] = 4;
                }else if((UserRFMP[index][3] < MQ[2]) && (UserRFMP[index][3] >= MQ[1])){  // 如果小於MQ3，且大於等於MQ2，得3分
                    UserRFMP[index][7] = 3;
                }else if((UserRFMP[index][3] < MQ[1]) && (UserRFMP[index][3] >= MQ[0])){  // 如果小於MQ2，且大於等於MQ1，得2分
                    UserRFMP[index][7] = 2;
                }else{  // 如果小於等於MQ1，得1分
                    UserRFMP[index][7] = 1;
                }
            } // 結束 玩家M評分計算
    
            for(let i=0;i < UserRFMP.length; i++){
                Mave = Mave + UserRFMP[i][7];
            }
            console.log("M評分總分數:",Mave);
            Mave = Mave / UserRFMP.length;
            console.log("M評分平均:",Mave);
    
            // // 更新使用者Mscore
            // for(let i=0;i < UserRFMP.length; i++){
            //     User.updateMscore(UserRFMP[i][0], UserRFMP[i][7] ,function (err, record) {
            //         if (err) throw err;
            //    })
            // }
            
            // P數據由大排到小
            let Ptime = UserRFMP.length;
            while(Ptime > 1){
                Ptime--;
                for(let i=0; i < UserRFMP.length-1;i++){
                    var temp;
                    if( UserRFMP[i][4] < UserRFMP[i+1][4] ){
                        temp = UserRFMP[i];
                        UserRFMP[i] = UserRFMP[i+1];
                        UserRFMP[i+1] = temp;
                    }
                }
            }
    
            // P數據的五分位數計算
            for(let i = 0; i < PQ.length; i++){
                if(i==3){   //取 80%  為 Q4
                    var position = UserRFMP.length*0.2;
                    if ((position % 1) == 0) {
                        PQ[i] = (UserRFMP[Math.floor(position)][4] + UserRFMP[Math.floor(position)+1][4])/2;
                    }else{
                        PQ[i] = UserRFMP[Math.floor(position)][4]; //整數無條件進位
                    }
                }
                if(i==2){   //取 60%  為 Q3
                    var position = UserRFMP.length*0.4;
                    if ((position % 1) == 0) {
                        PQ[i] = (UserRFMP[Math.floor(position)][4] + UserRFMP[Math.floor(position)+1][4])/2;
                    }else{
                        PQ[i] = UserRFMP[Math.floor(position)][4]; //整數無條件進位
                    }
                }
                if(i==1){   //取 40%  為 Q2
                    var position = UserRFMP.length*0.6;
                    if ((position % 1) == 0) {
                        PQ[i] = (UserRFMP[Math.floor(position)][4] + UserRFMP[Math.floor(position)+1][4])/2;
                    }else{
                        PQ[i] = UserRFMP[Math.floor(position)][4]; //整數無條件進位
                    }
                }
                if(i==0){   //取 20%  為 Q1
                    var position = UserRFMP.length*0.8;
                    if ((position % 1) == 0) {
                        PQ[i] = (UserRFMP[Math.floor(position)][4] + UserRFMP[Math.floor(position)+1][4])/2;
                    }else{
                        PQ[i] = UserRFMP[Math.floor(position)][4]; //整數無條件進位
                    }
                }
            }
            console.log("PQ:",PQ);
            // 結束 P數據的五分位數計算
            console.log("F評分總分數 init:",Fave);
            // 玩家P評分計算
            for(let index = 0; index < UserRFMP.length; index++){
                if(UserRFMP[index][4] >= PQ[3]){  // 如果大於等於PQ4，得5分
                    UserRFMP[index][8] = 5;
                }else if((UserRFMP[index][4] < PQ[3]) && (UserRFMP[index][4] >= PQ[2])){  // 如果小於PQ4，且大於等於PQ3，得4分
                    UserRFMP[index][8] = 4;
                }else if((UserRFMP[index][4] < PQ[2]) && (UserRFMP[index][4] >= PQ[1])){  // 如果小於PQ3，且大於等於PQ2，得3分
                    UserRFMP[index][8] = 3;
                }else if((UserRFMP[index][4] < PQ[1]) && (UserRFMP[index][4] >= PQ[0])){  // 如果小於PQ2，且大於等於PQ1，得2分
                    UserRFMP[index][8] = 2;
                }else{  // 如果小於等於PQ1，得1分
                    UserRFMP[index][8] = 1;
                }
                if(UserRFMP[index][4] == 0 ){  // 如果等於0，得0分
                    UserRFMP[index][8] = 0;
                }
            } // 結束 玩家P評分計算
    
            for(let i=0;i < UserRFMP.length; i++){
                Fave = Fave + UserRFMP[i][8];
            }
            console.log("F評分總分數:",Fave);
            Fave = Fave / UserRFMP.length;
            console.log("F評分平均:",Fave);
    
            // // 更新使用者Pscore
            // for(let i=0;i < UserRFMP.length; i++){
            //     User.updatePscore(UserRFMP[i][0], UserRFMP[i][8] ,function (err, record) {
            //         if (err) throw err;
            //    })
            // }


            for(let i=0;i < UserRFMP.length; i++){
                console.log("裡面UserRFMP[",i,"]:",UserRFMP[i]);
            }
        }) // 結束 UserSpendTime.getAllUserSpendTimeState
        for(let i=0;i < UserRFMP.length; i++){
            console.log("外面UserRFMP[",i,"]:",UserRFMP[i]);
        }
        
        
    }) // 結束 User.getAllUser
    
});

// 以上宜靜 2020.04.14

router.get('/management', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)
    if (!(req.user.username == "NKUSTCCEA"||req.user.username == "teacher")) { //如有其他管理者 在這加
        res.redirect('/login')
    }
    res.render('backstage/management', {
        user: req.user.username
    });
});
router.post('/management', function (req, res, next) {
    // Parse Info

    var type = req.body.type
    console.log("home post--------");
    console.log(req.body.type);
    console.log("--------------");
    if (type == "init") {
        var id = req.user.id;
        // console.log(req.user.id);
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            res.json(user);
        })
    } else if (type == "loadmusicData") {
        if (req.session.bkMusicVolumn && req.session.musicLevel && req.session.bkMusicSwitch) {
            req.session.bkMusicVolumn = arseInt(req.body.bkMusicVolumn);
            req.session.bkMusicSwitch = parseInt(req.body.bkMusicSwitch);
            req.session.musicLevel = parseInt(req.body.musicLevel);
            console.log("tstt success");
            scriptData = {
                bkMusicVolumn: req.session.bkMusicVolumn
                , bkMusicSwitch: req.session.bkMusicSwitch
                , musicLevel: req.session.musicLevel
            }
            res.json(JSON.stringify(scriptData));
        }
        else {
            console.log("tstt nome");
            scriptData = {
                bkMusicVolumn: 0.1
                , bkMusicSwitch: 1
                , musicLevel: 1
            }
            req.session.bkMusicVolumn = 0.1;
            req.session.bkMusicSwitch = 1;
            req.session.musicLevel = 1;
            res.json(scriptData);

        }

    }

});

router.get('/managementStatistics', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)
    if (!(req.user.username == "NKUSTCCEA"||req.user.username == "teacher")) { //如有其他管理者 在這加
        res.redirect('/login')
    }
    res.render('backstage/managementStatistics', {
        user: req.user.username
    });
});
router.post('/managementStatistics', function (req, res, next) {
    // Parse Info
    var type = req.body.type
    console.log("home post--------");
    console.log(req.body.type);
    console.log("--------------");
    if (type == "init") {
        var id = req.user.id;
        // console.log(req.user.id);
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            res.json(user);
        })
    } else if (type == "loadmusicData") {
        if (req.session.bkMusicVolumn && req.session.musicLevel && req.session.bkMusicSwitch) {
            req.session.bkMusicVolumn = arseInt(req.body.bkMusicVolumn);
            req.session.bkMusicSwitch = parseInt(req.body.bkMusicSwitch);
            req.session.musicLevel = parseInt(req.body.musicLevel);
            console.log("tstt success");
            scriptData = {
                bkMusicVolumn: req.session.bkMusicVolumn
                , bkMusicSwitch: req.session.bkMusicSwitch
                , musicLevel: req.session.musicLevel
            }
            res.json(JSON.stringify(scriptData));
        }
        else {
            console.log("tstt nome");
            scriptData = {
                bkMusicVolumn: 0.1
                , bkMusicSwitch: 1
                , musicLevel: 1
            }
            req.session.bkMusicVolumn = 0.1;
            req.session.bkMusicSwitch = 1;
            req.session.musicLevel = 1;
            res.json(scriptData);

        }

    }
    else if (type == "readAllPlay") {
        User.getUser(req.user.id, function (err, users) {
            if (err) throw err;
            res.json(users);
        })
    }
    else {

    }

});

router.get('/', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)

    User.getUserById(req.user.id, function (err, user) {
        if (err) throw err;
        if (!(req.user.username == "NKUSTCCEA"||req.user.username == "teacher")) { //如有其他管理者 在這加
            res.redirect('/home')
        }

        /*初次一定要做 預設檔案進db*/
        // var dictJson = testDict.dict.code;
        // for (let index = 0; index < dictJson.length; index++) {
        //     console.log(dictJson[index].type, dictJson[index].element);
        //     var newDictionary = new DictionaryRecord({
        //         type:dictJson[index].type,
        //         element:dictJson[index].element
        //     })
        //     DictionaryRecord.createDictionary(newDictionary, function (err, dict) {

        //         console.log(dict);
        //     })
        // }
        // var equipJson = testEquip;
        // var newEquipment = new EquipmentRecord({
        //     levelUpLevel: equipJson.levelUpLevel,
        //     weaponLevel:equipJson.weaponLevel,
        //     armorLevel: equipJson.armorLevel
        // })
        // EquipmentRecord.createEquipment(newEquipment, function (err, dict) {
        //     console.log(dict);
        // })

        var openLokCastle = false;
        var codeLevel = -1;
        for (let index = 0; index < user.EasyEmpire.codeLevel.length; index++) {
            const element = user.EasyEmpire.codeLevel[index];
            if (parseInt(element.level) > codeLevel && element.HighestStarNum > 0) {
                codeLevel = parseInt(element.level);
                if (parseInt(element.level) >= 23) {
                    openLokCastle = true;
                    break;
                }
                else {
                    // console.log(codeLevel, parseInt(element.level));
                }
            }
        }
        var blockLevel = -1;
        for (let index = 0; index < user.EasyEmpire.blockLevel.length; index++) {
            const element = user.EasyEmpire.blockLevel[index];
            if (parseInt(element.level) > blockLevel && element.HighestStarNum > 0) {
                blockLevel = parseInt(element.level);
                if (parseInt(element.level) >= 23) {
                    openLokCastle = true;
                    break;
                }
                else {
                    // console.log(blockLevel, parseInt(element.level));
                }
            }
        }
        var codeLevel = user.EasyEmpire.codeLevel.length;
        var blockLevel = user.EasyEmpire.blockLevel.length;
        var totalLevel = Math.max(codeLevel, blockLevel);
        var lock = "unCastle_code";
        if (openLokCastle) {
            lock = "castle_code";
        }


        res.render('home/homeByManage', {
            user: req.user.username,
            castlelock: lock,
        });
    })
});
router.post('/', function (req, res, next) {
    console.log(req.body);
    // Parse Info
    var type = req.body.type
    console.log("home post--------");
    console.log(req.body.type);
    console.log("--------------");
    if (type == "init") {
        var id = req.user.id;
        // console.log(req.user.id);
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            res.json(user);
        })
    } else if (type == "loadmusicData") {
        /*if(req.session.bkMusicVolumn && req.session.musicLevel && req.session.bkMusicSwitch){
          req.session.bkMusicVolumn=arseInt(req.body.bkMusicVolumn);
          req.session.bkMusicSwitch=parseInt(req.body.bkMusicSwitch);
          req.session.musicLevel=parseInt(req.body.musicLevel);
          console.log("tstt success");
          scriptData={
            bkMusicVolumn: req.session.bkMusicVolumn
            ,bkMusicSwitch: req.session.bkMusicSwitch
            ,musicLevel: req.session.musicLevel
          }
          res.json(JSON.stringify(scriptData));
        }
        else{
          console.log("tstt nome");
          scriptData={
            bkMusicVolumn: 0.1
            ,bkMusicSwitch: 1
            ,musicLevel: 1
          }
          req.session.bkMusicVolumn=0.1;
          req.session.bkMusicSwitch=1;
          req.session.musicLevel=1;
          res.json(JSON.stringify(scriptData));

        }*/

    }

    /**更新部分 */
    else if (type == "resetEquip") {
        var id = req.user.id;
        User.updateResetEquip(id, function (err, user) {
            if (err) throw err;
            console.log("up   :", user);
            User.getUserById(id, function (err, user) {
                if (err) throw err;
                res.json(user);
            })
        })
    }
    else if (type == "userMap") {
        MapRecord.getMapByUserID(req.user.id, function (err, map) {
            if (err) throw err;
            var dataMap = [];
            for (let indexM = 0; indexM < map.length; indexM++) {
                const element = map[indexM];
                if (element.check == true && element.postStage == 2) {
                    dataMap.push(element);
                }

            }
            res.json(dataMap);
            // console.log(req.user.id);
            // console.log(map);
            // res.json(map);
        })
    }
    /********* */
    else if (type == "weaponLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var weaponLevel = parseInt(user.weaponLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateWeaponLevel(id, weaponLevel, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }
        })
    }
    else if (type == "armorLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var armorLevelup = parseInt(user.armorLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateArmorLevel(id, armorLevelup, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }
        })
    }
    //-----暫時的 ------

    else if (type == "changePassword") {
        var id = req.user.id
        var password = req.body.password
        var oldPassword = req.body.oldPassword
        // console.log(password,oldPassword);

        User.getUserById(id, function (err, user) {
            if (err) throw err;
            if (user) {
                // console.log(user);
                User.comparePassword(oldPassword, user.password, function (err, isMatch) {
                    if (err) throw err
                    if (isMatch) {
                        req.flash('success_msg', 'you are updatePass now')
                        User.updatePassword(user.username, password, function (err, user) {
                            if (err) throw err;
                            // console.log("update :", user);
                        })
                        req.session.updatePassKey = null;
                        return res.json({ responce: 'sucesss' });
                    } else {
                        return res.json({ responce: 'failPassUndifine' });
                    }
                })
            } else {
                return res.json({ responce: 'error' });
            }
        })
        // res.redirect('/login')
    }
    else if (type == "loadDict") {
        DictionaryRecord.getDictionary(function (err, dict) {
            returnData = dict.sort(function (a, b) {
                return a.level > b.level ? 1 : -1;
            });
            res.json(returnData);

        });
    }
    else if (type == "loadEquip") {
        EquipmentRecord.getEquipment(function (err, equip) {
            res.json(equip[0]);

        });
    }
    else if (type == "updateEquip") {
        var seriJson = JSON.parse(req.body.seriJson)
        var armorLevel = seriJson.armorLevel;
        var weaponLevel = seriJson.weaponLevel;
        var levelUpLevel = seriJson.levelUpLevel;
        // console.log(seriJson);
        // console.log(armorLevel,weaponLevel,levelUpLevel);
        EquipmentRecord.updateEquipment(armorLevel, weaponLevel, levelUpLevel, function (err, dictResult) {
            if (err) throw err;
            res.json({ res: true });
        });
    }
    else if (type == "updateDict") {
        var dictType = req.body.dictType
        var dictNum = req.body.dictNum
        var dictValue = req.body.dictValue
        console.log(dictType, dictNum, dictValue);
        DictionaryRecord.getDictionary(function (err, dict) {
            if (err) throw err;
            var typeIndex = 0;
            for (let index = 0; index < dict.length; index++) {
                var element = dict[index];
                if (element.type == dictType) {
                    element.element[dictNum].value = dictValue;
                    typeIndex = index;
                    break;
                    // console.log(element);

                }
            }
            DictionaryRecord.updateDictionaryByType(dict[typeIndex].type, dict[typeIndex].element, function (err, dictResult) {
                if (err) throw err;
                res.json({ res: true });
            });
        });
    }
    //-------------------
    else {

    }

});

router.get('/home', ensureAuthenticated, function (req, res, next) {
    // console.log(req.user)

    User.getUserById(req.user.id, function (err, user) {
        if (err) throw err;
        if ((req.user.username == "NKUSTCCEA"||req.user.username == "teacher")) { //如有其他管理者 在這加
            return res.redirect('/management');
        }
        var openLokCastle = false;
        var codeLevel = -1;
        for (let index = 0; index < user.EasyEmpire.codeLevel.length; index++) {
            const element = user.EasyEmpire.codeLevel[index];
            if (parseInt(element.level) > codeLevel && element.HighestStarNum > 0) {
                codeLevel = parseInt(element.level);
                if (parseInt(element.level) >= 23) {
                    openLokCastle = true;
                    break;
                }
                else {
                    console.log(codeLevel, parseInt(element.level));
                }
            }
        }
        var blockLevel = -1;
        for (let index = 0; index < user.EasyEmpire.blockLevel.length; index++) {
            const element = user.EasyEmpire.blockLevel[index];
            if (parseInt(element.level) > blockLevel && element.HighestStarNum > 0) {
                blockLevel = parseInt(element.level);
                if (parseInt(element.level) >= 23) {
                    openLokCastle = true;
                    break;
                }
                else {
                    console.log(blockLevel, parseInt(element.level));
                }
            }
        }
        var codeLevel = user.EasyEmpire.codeLevel.length;
        var blockLevel = user.EasyEmpire.blockLevel.length;
        var totalLevel = Math.max(codeLevel, blockLevel);
        var lock = "unCastle_code";
        if (openLokCastle) {
            lock = "castle_code";
        }
        console.log(JSON.stringify(req.user).toString());
        // DictionaryRecord.getDictionary(function (err, dict) {
        //     EquipmentRecord.getEquipment(function (err, equip) {
        //         return res.render('home/home', {
        //             user: req.user.username,
        //             castlelock: lock,
        //             player:JSON.stringify(req.user).toString(),
        //             gameDict:JSON.stringify(dict).toString(),
        //             gameEquip:JSON.stringify(equip[0]).toString()
        //         });
        //     });
        // });
        return res.render('home/home', {
            user: req.user.username,
            castlelock: lock
        });
    })
});
router.post('/home', function (req, res, next) {
    console.log(req.body);
    // Parse Info
    var type = req.body.type
    console.log("home post--------");
    console.log(req.body.type);
    console.log("--------------");
    if (type == "init") {
        var id = req.user.id;
        // console.log(req.user.id);
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            res.json(user);
        })
    } else if (type == "loadmusicData") {
        /*if(req.session.bkMusicVolumn && req.session.musicLevel && req.session.bkMusicSwitch){
          req.session.bkMusicVolumn=arseInt(req.body.bkMusicVolumn);
          req.session.bkMusicSwitch=parseInt(req.body.bkMusicSwitch);
          req.session.musicLevel=parseInt(req.body.musicLevel);
          console.log("tstt success");
          scriptData={
            bkMusicVolumn: req.session.bkMusicVolumn
            ,bkMusicSwitch: req.session.bkMusicSwitch
            ,musicLevel: req.session.musicLevel
          }
          res.json(JSON.stringify(scriptData));
        }
        else{
          console.log("tstt nome");
          scriptData={
            bkMusicVolumn: 0.1
            ,bkMusicSwitch: 1
            ,musicLevel: 1
          }
          req.session.bkMusicVolumn=0.1;
          req.session.bkMusicSwitch=1;
          req.session.musicLevel=1;
          res.json(JSON.stringify(scriptData));

        }*/

    }

    /**更新部分 */
    else if (type == "resetEquip") {
        var id = req.user.id;
        User.updateResetEquip(id, function (err, user) {
            if (err) throw err;
            console.log("up   :", user);
            User.getUserById(id, function (err, user) {
                if (err) throw err;
                res.json(user);
            })
        })
    }
    else if (type == "userMap") {
        MapRecord.getMapByUserID(req.user.id, function (err, map) {
            if (err) throw err;
            var dataMap = [];
            for (let indexM = 0; indexM < map.length; indexM++) {
                const element = map[indexM];
                if (element.check == true && element.postStage == 2) {
                    dataMap.push(element);
                }

            }
            res.json(dataMap);
            // console.log(req.user.id);
            // console.log(map);
            // res.json(map);
        })
    }
    /********* */
    else if (type == "weaponLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var weaponLevel = parseInt(user.weaponLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateWeaponLevel(id, weaponLevel, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }
        })
    }
    else if (type == "armorLevelup") {
        var id = req.user.id;
        User.getUserById(id, function (err, user) {
            if (err) throw err;
            var armorLevelup = parseInt(user.armorLevel) + 1
            var levelUpLevel = parseInt(user.levelUpLevel)
            // if (Equipment.levelUpLevel[levelUpLevel].star > user.starNum) {
            //     res.json({ err: "error" });
            // }
            // else {
            levelUpLevel += 1;
            User.updateArmorLevel(id, armorLevelup, levelUpLevel, function (err, user) {
                if (err) throw err;
                // console.log("up   :", user);
                User.getUserById(id, function (err, user) {
                    if (err) throw err;
                    res.json(user);
                })
            })
            // }
        })
    }
    //-----暫時的 ------
    else if (type == "loadDict") {
        DictionaryRecord.getDictionary(function (err, dict) {
            returnData = dict.sort(function (a, b) {
                return a.level > b.level ? 1 : -1;
            });
            res.json(returnData);

        });
    }
    else if (type == "loadEquip") {
        EquipmentRecord.getEquipment(function (err, equip) {
            res.json(equip[0]);
        });
    }
    else if (type == "updateEquip") {
        var seriJson = JSON.parse(req.body.seriJson)
        var armorLevel = seriJson.armorLevel;
        var weaponLevel = seriJson.weaponLevel;
        var levelUpLevel = seriJson.levelUpLevel;
        // console.log(seriJson);
        // console.log(armorLevel,weaponLevel,levelUpLevel);
        EquipmentRecord.updateEquipment(armorLevel, weaponLevel, levelUpLevel, function (err, dictResult) {
            if (err) throw err;
            res.json({ res: true });
        });
    }
    else if (type == "changePassword") {
        var id = req.user.id
        var password = req.body.password
        var oldPassword = req.body.oldPassword
        // console.log(password,oldPassword);

        User.getUserById(id, function (err, user) {
            if (err) throw err;
            if (user) {
                // console.log(user);
                User.comparePassword(oldPassword, user.password, function (err, isMatch) {
                    if (err) throw err
                    if (isMatch) {
                        req.flash('success_msg', 'you are updatePass now')
                        User.updatePassword(user.username, password, function (err, user) {
                            if (err) throw err;
                            // console.log("update :", user);
                        })
                        req.session.updatePassKey = null;
                        return res.json({ responce: 'sucesss' });
                    } else {
                        return res.json({ responce: 'failPassUndifine' });
                    }
                })
            } else {
                return res.json({ responce: 'error' });
            }
        })
        // res.redirect('/login')
    }

    //-------------------
    else {

    }

});


router.get('/logout', function (req, res, next) {
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/login')
})

router.post('/loadGameMap', function (req, res, next) {
    console.log(req.body);
    console.log("loadGameMap post--------");

    var levelId = req.body.gameLevel;
    console.log(req.body.gameLevel);
    GameMapRecord.getMapByLevel(levelId, function (err, mapData) {
        res.json(mapData);
    });

});
router.post('/updateGameMap', function (req, res, next) {
    console.log(req.body);
    console.log("loadGameMap post--------");

    var levelId = req.body.gameLevel;
    var scriptData = JSON.parse(req.body.data);
    // console.log(scriptData);
    GameMapRecord.updateMapByLevel(levelId, scriptData, function (err, mapData) {
        return res.json(mapData);
    });
});

router.post('/loadGameMapData', function (req, res, next) {
    var start = 0, end = 50;
    GameMapRecord.getMap(function (err, mapData) {
        // res.json(mapData);
        if (err)
            console.log(err);

        var returnData = [];
        for (let index = start; index < end; index++) {
            var element = mapData[index];
            // console.log(element.level);

            for (let entry = 0; entry < element.data.length; entry++) {
                var entryItem = element.data[entry];
                // console.log(entryItem);
                if (entryItem.versionID == element.versionID) {
                    returnData.push(
                        entryItem.description
                    );
                    break;
                }
            }
        }

        returnData = returnData.sort(function (a, b) {
            return a.level > b.level ? 1 : -1;
        });
        res.json(returnData);
    })

});

router.post('/loadThisLevelGameMapData', function (req, res, next) {
    var level = req.body.level
    var gameMode = req.body.gameMode   // code  blocky
    console.log(req.body, level, gameMode);
    var start = 0, end = 50;
    if(gameMode=="code"){
        var mainDescription="mainCodeDescription";
    }
    else{
        var mainDescription="mainBlockyDescription";
        // end=24;
    }
    GameMapRecord.getMap(function (err, mapData) {
        // res.json(mapData);
        if (err)
            console.log(err);
        var returnData = [];
        for (let index = start; index < end; index++) {
            var element = mapData[index];
            if (gameMode == "blocky" && element.level>=24) {
                continue;
            }
            if (element.level != level) {
                returnData.push({
                    level: element.level + 1
                })
                continue;
            }
            for (let entry = 0; entry < element.data.length; entry++) {
                var entryItem = element.data[entry];
                // console.log(entryItem);
                if (entryItem.versionID == element.versionID) {
                    returnData.push(
                        entryItem[mainDescription]
                    );
                    break;
                }
            }
        }

        console.log(returnData);
        returnData = returnData.sort(function (a, b) {
            return a.level > b.level ? 1 : -1;
        });
        res.json(returnData);
    })

});

router.post('/loadThisLevelGameMapMap', function (req, res, next) {
    var level = req.body.level
    console.log(req.body, level);
    var start = 0, end = 50;
    GameMapRecord.getMap(function (err, mapData) {
        // res.json(mapData);
        if (err)
            console.log(err);
        for (let index = start; index < end; index++) {
            var element = mapData[index];
            if (element.level != level) {
                continue;
            }
            for (let entry = 0; entry < element.data.length; entry++) {
                var entryItem = element.data[entry];
                // console.log(entryItem);
                if (entryItem.versionID == element.versionID) {
                    return res.json(entryItem.map);
                }
            }
        }
    })

});
router.post('/changeUserCreateMapPermission', function (req, res, next) {
    var userId = req.body.userId
    var canCreateMapPermission = req.body.canCreateMapPermission
    User.updateUserCreateMapPermission(userId, canCreateMapPermission, function (err, users) {
        if (err) throw err;
        res.json(users);
    })

});


module.exports = router;

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'you are not logged in')
        res.redirect('/login')
    }
}
