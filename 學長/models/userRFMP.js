// 先載入我們要的library
// 宜靜
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var User = require('../models/user');

//創造資料庫需要的欄位(schema)
var UserRFMPSchema = mongoose.Schema({
    username: { type: String, index: true },
    name: { type: String },
    email: { type: String },
    R_data: { type: Number, "default": 0 },
    F_data: {type: Number, "default": 0},
    M_data: { type: Number, "default": 0 },
    P_data: { type: Number, "default": 0 },
    R_value: { type: Number, "default": 0},
    F_value: { type: Number, "default": 0},
    M_value: { type: Number, "default": 0},
    P_value: { type: Number, "default": 0},
})

var UserRFMP = module.exports = mongoose.model('UserRFMP', UserRFMPSchema)

module.exports.createUserRFMP = function (newUserRFMP, callback) {
    newUserRFMP.save(callback)
}

//updateR_data 更新R的原始數據
module.exports.updateR_data = function(email, R_data, callback) {
    var query = {
        email: email
    }
    var setquery = {
        R_data: R_data
    }
    UserRFMP.updateOne(query, setquery, callback);
}

//updateF_data 更新F的原始數據
module.exports.updateF_data = function(email, F_data, callback) {
    var query = {
        email: email
    }
    var setquery = {
        F_data: F_data
    }
    UserRFMP.updateOne(query, setquery, callback);
}

//updateM_data 更新M的原始數據
module.exports.updateM_data = function(email, M_data, callback) {
    var query = {
        email: email
    }
    var setquery = {
        M_data: M_data
    }
    UserRFMP.updateOne(query, setquery, callback);
}

//updateP_data 更新P的原始數據
module.exports.updateM_data = function(email, P_data, callback) {
    var query = {
        email: email
    }
    var setquery = {
        P_data: P_data
    }
    UserRFMP.updateOne(query, setquery, callback);
}

//updateR_value 更新R的評分值
module.exports.updateM_data = function(email, R_value, callback) {
    var query = {
        email: email
    }
    var setquery = {
        R_value: R_value
    }
    UserRFMP.updateOne(query, setquery, callback);
}

//updateF_value 更新F的評分值
module.exports.updateM_data = function(email, F_value, callback) {
    var query = {
        email: email
    }
    var setquery = {
        F_value: F_value
    }
    UserRFMP.updateOne(query, setquery, callback);
}

//updateM_value 更新M的評分值
module.exports.updateM_data = function(email, M_value, callback) {
    var query = {
        email: email
    }
    var setquery = {
        M_value: M_value
    }
    UserRFMP.updateOne(query, setquery, callback);
}

//updateP_value 更新P的評分值
module.exports.updateM_data = function(email, P_value, callback) {
    var query = {
        email: email
    }
    var setquery = {
        P_value: P_value
    }
    UserRFMP.updateOne(query, setquery, callback);
}