const bodyParser = require("body-parser");
const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");
const Hendlebars = require("hbs");

app.use(session({ secret: 'secretpassword', cookie: { maxAge: 60000*60*60*60 }, saveUninitialized: true, resave: true}));
app.set("view engine", "hbs");
Hendlebars.registerPartials(__dirname + "/views/partials");
app.use(express.static(path.join(__dirname, '/public')));

const urlencodedParser = bodyParser.urlencoded({extended: false});

Hendlebars.registerHelper('isdefined', function (value) {
    if(value !== undefined)
    return value;
    else
    return undefined;
  });

  Hendlebars.registerHelper('isnull', function (value) {
    if(value !== null)
    return value;
    else
    return undefined;
  });

  Hendlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

app.get("/", function(req, res){
    
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "samsarabd"
    });

    connection.query("SELECT * from countries", function(err,data){
        
        if(err) 
        console.log(err);

        connection.end();
        res.render("index", {data:data, navbar:data, sessionUser:req.session.user});
    });
   
});

app.get("/country_:id", function(req, res){
    
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "samsarabd"
    });

  
    connection.query("SELECT * from countries a left join cities b on a.id_country=b.id_country left join hotels c on b.id_city=c.id_hotel left JOIN images d on c.id_img=d.id_images WHERE a.id_country='"+req.url.replace(/\/\w+\_/gi, '')+"'", function(err,data){
        
        if(err) 
        console.log(err);
        
        connection.query("SELECT * from countries", function(err,navbar){
        
            if(err) 
            console.log(err);

            connection.query("SELECT * from proffers a inner join images b on a.id_img=b.id_images WHERE NOT EXISTS(SELECT id_proffer from orders where id_proffer=a.proffer_id) and data_start>now()", function(err,proffer){

                if(err) 
                console.log(err);

                connection.end();
                res.render("country", {data:data, navbar:navbar, proffer:proffer, sessionUser:req.session.user});
                
            })
             
        });
        
    });
   
});

app.get("/profile", function(req,res){

    if(typeof req.session.user!=='undefined'){

        var connection = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "samsarabd"
        });

        connection.query("SELECT * from countries", function(err,navbar){
        
        if(err) 
        console.log(err);
        else
        connection.query("SELECT * from users a LEFT JOIN orders b on a.id_user=b.id_user left join proffers c on b.id_proffer=c.proffer_id left join hotels d on c.hotel_id=d.id_hotel left join cities e on d.id_city=e.id_city left join countries f on e.id_country=f.id_country WHERE a.email='"+req.session.user+"' order by data_start", function(err,data){

            console.log(data);
        connection.end();
        console.log(data);
        res.render("profile", {navbar:navbar, data:data, sessionUser:req.session.user});
        });
    });
    }
    else
    res.redirect("/login");
    
});

app.get("/proffer_:id", function(req,res){

    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "samsarabd"
    });

 

    connection.query("SELECT * from countries", function(err,navbar){
        if(err)
        { 
            console.log(err);
            connection.end();
        }
        else
        connection.query("SELECT * from proffers a inner join hotels b on a.hotel_id=b.id_hotel inner join images c on a.id_img=c.id_images where proffer_id="+req.url.replace(/\D/gi,'')+";", function(err,data){
            
            connection.end();
            res.render("proffer", {navbar:navbar, data:data[0], sessionUser:req.session.user});
        }); 
        
    });

    
});

app.get("/login", function(req, res){

    res.render('login');
});

app.get("/registration", function(req, res){

    res.render('registration');
});

app.get("/unlogin", function(req,res){
    req.session.destroy();

    res.redirect("/");
})

app.get("/thanks", function(req,res){

    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "samsarabd"
    });

        
    connection.query("SELECT * from countries", function(err,navbar){

           
                if(err) 
                console.log(err);

                connection.end();
                res.render("thanks", {navbar:navbar, sessionUser:req.session.user});    
             
        });

});

app.post("/login", urlencodedParser, function(req,res){

    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "samsarabd"
    });

    connection.query("SELECT * from users where email='"+`${req.body.em}`+"' and password='"+`${req.body.ps}`+"';", function(err,data){


        if(err)
        {
            connection.end();
            
        }
        else
        {

 
            if(typeof data[0]!=='undefined'){
            connection.end();
            req.session.user = `${req.body.em}`;
            res.redirect("profile");}
            else
            {
                connection.end();
            res.render("login");
            }
        }
    });
});

app.post("/registration", urlencodedParser, function(req,res){

    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "samsarabd"
    });

    connection.query("SELECT email from users where email='"+`${req.body.em}`+"'", function(err,data){

        if(typeof data[0]!=='undefined')
        {
            
            connection.end();
            res.redirect("/registration");
        }
        else
        {
            connection.query(`INSERT INTO users VALUE(null,'${req.body.em}','${req.body.ps}','${req.body.na}','${req.body.sn}','${req.body.mdl}','${req.body.ph}')`, function(err,data){

                req.session.user=`${req.body.em}`;
                connection.end();
                res.redirect("profile");
            });
        
        }
    });
});

app.post("/order", urlencodedParser, function(req,res){

    if(typeof req.session.user=='undefined')
        res.redirect("/login");
    else
    {
        var connection = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "samsarabd"
        });

        connection.query("INSERT INTO orders (id_order, id_user, id_proffer, creation_date) SELECT null, a.id_user, c.proffer_id, NOW() FROM users a, proffers c WHERE a.email='"+req.session.user+"' and c.proffer_id="+`${req.body.idprof}`+";", function(err,data){
            if(err)
            console.log(err);

            connection.end();
            res.redirect('thanks');
        });
    }

});
app.listen(3000);