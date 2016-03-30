var mongodb = require('./db');

function UserModel(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = UserModel;

UserModel.prototype.save = function (callback) {
    var tmpUser = {
        name : this.name,
        password : this.password,
        email : this.email
    };
    
    mongodb.open(function (err, db) {
       if(err) {
           return callback(err);
       } 
       
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            
            collection.insert(tmpUser, {
               safe: true 
            }, function (err, user) {
                mongodb.close();
                if (err) {
                   return callback(err);
                }
                callback(null, user[0]);
            });
       });
    });
};
    
UserModel.get = function (name, callback) {    
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            
            collection.findOne({
                name: name
            }, function (err, user) {
                mongodb.close();
                if (err) {
                   return callback(err);
                }
                callback(null, user);
            });
        });
    });       
};