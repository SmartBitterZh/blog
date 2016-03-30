var express = require('express');
// 首先引入 express-session 这个模块
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var routes = require('./routes/routes');
var path = require('path');
var settings = require('./settings');

var app = express();


app.listen(5000);

app.use(express.static(path.join(__dirname, 'public')));

// 按照上面的解释，设置 session 的可选参数
app.use(session({
    secret: settings.cookieSecret,
    store: new MongoStore({
        url: settings.mongodburl,
        autoRemove: 'interval',
        autoRemoveInterval: 10 // In minutes. Default
    }),
    cookie: { maxAge: 900000 } // expire session in 15 min or 900 seconds
}));

routes(app);
