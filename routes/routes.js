var crypto = require('crypto'),
    UserModel = require('../models/user.js');
    PostModel = require('../models/post.js');

module.exports = function(app) {
    app.get('/', function (req, res) {
        PostModel.get(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            posts.forEach(function(element) {
                while(element.post.indexOf('\r\n')>-1)
                   element.post = element.post.replace('\r\n','<br />')
            }, this);
            
            res.render('index', {
                title: '主页', 
                user: req.session.user, 
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    app.get('/reg', function (req, res) {
        checkNotLogin(req, res);
        res.render('reg', { 
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
         });        
    });
    app.post('/reg', function (req, res) {
        checkNotLogin(req, res);
        var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
        
        if (password_re != password) {
            req.flash('error', '两次输入的密码不一致!'); 
            return res.redirect('/reg');
        }        
            
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new UserMode({
            name: name,
            password: password,
            email: req.body.email
        });
        
        //检查用户名是否已经存在 
        UserMode.get(newUser.name, function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            if(user) {
                req.flash('error', 'user alreadly exist');
                return res.redirect('/reg');
            }
            
            newUser.save(function (err, user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.flash('success', '注册成功!');
                res.redirect('/');
            });
        });     
    });
    app.get('/login', function (req, res) {
            checkNotLogin(req, res);
            res.render('login', { title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });      
    });
    app.post('/login', function (req, res) {
        checkNotLogin(req, res);
        var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
        UserModel.get(req.body.name, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在!'); 
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', '密码错误!'); 
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success', '登陆成功!');
            res.redirect('/');
        });
    });
    app.get('/post', function (req, res) {
        checkLogin(req, res);
        res.render('post', { 
            title: '发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/post', function (req, res) {
        checkLogin(req, res);
        var currentUser = req.session.user,
        post = new PostModel(currentUser.name, req.body.title, req.body.post);
        post.save(function (err) {
            if (err) {
                req.flash('error', err); 
                return res.redirect('/');
            }
            req.flash('success', '发布成功!');
            res.redirect('/');
        });
    });
    app.get('/logout', function (req, res) {
        checkLogin(req, res);
        req.session.user = null;
        req.flash('success', '登出成功!');
        res.redirect('/');
    });
    
    function checkLogin(req, res, next) {
        if(!req.session.user) {
            req.flash('error', '未登入');
            res.redirect('/login');
        }
    };    
    function checkNotLogin(req, res, next) {
        if(req.session.user) {
            req.flash('error', '已登入');
            res.redirect('back');
        }
    };    
};