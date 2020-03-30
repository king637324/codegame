//先載入我們要的library
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs')
var User = require('../models/user');

//創造資料庫需要的欄位(schema)
var UserRFMPSchema = mongoose.Schema({
    username: { type: String, index: true },
    name: { type: String },
    email: { type: String },
    lasttimeLogin: { type: Date },
    thistimeLogin: { type: Date },
    startplay: { type: Date },
    endplay: { type: Date },
    R_data: { type: Date },
    F_data: {type: Number, "default": 0},
    M_data: { type: Date },
    P_data: { type: Number, "default": 0 },
    R_value: { type: Numbere, "default": 0},
    F_value: {type: Number, "default": 0},
    M_value: { type: Number, "default": 0},
    P_value: { type: Number, "default": 0},
})

var UserRFMP = module.exports = mongoose.model('UserRFMP', UserSchema)

module.exports.createUserRFMPState = function (newUserRFMPState, callback) {
    newUserRFMPState.save(callback)
}


//updatelasttimeLogin 更新最後一次登入時間
module.exports.updatelasttimeLogin = function(id, lasttimeLogin, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        lasttimeLogin: lasttimeLogin
    }
    User.updateOne(query, setquery, callback);
}

//updatethistimeLogin 更新這一次登入時間
module.exports.updatethistimeLogin = function(id, thistimeLogin, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        thistimeLogin: thistimeLogin
    }
    User.updateOne(query, setquery, callback);
}

//updatestartplay 更新開始玩關卡的時間
module.exports.updatestartplay = function(id, startplay, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        startplay: startplay
    }
    User.updateOne(query, setquery, callback);
}

//updateendplay 更新結束玩關卡的時間
module.exports.updateendplay = function(id, endplay, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        endplay: endplay
    }
    User.updateOne(query, setquery, callback);
}

//updateR_data 更新R的原始數據
module.exports.updateR_data = function(id, R_data, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        R_data: R_data
    }
    User.updateOne(query, setquery, callback);
}

//updateF_data 更新F的原始數據
module.exports.updateF_data = function(id, F_data, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        F_data: F_data
    }
    User.updateOne(query, setquery, callback);
}

//updateM_data 更新M的原始數據
module.exports.updateM_data = function(id, M_data, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        M_data: M_data
    }
    User.updateOne(query, setquery, callback);
}

//updateP_data 更新P的原始數據
module.exports.updateM_data = function(id, P_data, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        P_data: P_data
    }
    User.updateOne(query, setquery, callback);
}

//updateR_value 更新R的評分值
module.exports.updateM_data = function(id, R_value, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        R_value: R_value
    }
    User.updateOne(query, setquery, callback);
}

//updateF_value 更新F的評分值
module.exports.updateM_data = function(id, F_value, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        F_value: F_value
    }
    User.updateOne(query, setquery, callback);
}

//updateM_value 更新M的評分值
module.exports.updateM_data = function(id, M_value, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        M_value: M_value
    }
    User.updateOne(query, setquery, callback);
}

//updateP_value 更新P的評分值
module.exports.updateM_data = function(id, P_value, callback) {
    var query = {
      _id: id
    }
    var setquery = {
        P_value: P_value
    }
    User.updateOne(query, setquery, callback);
}