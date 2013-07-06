var express = require('express'),
	engines = require('consolidate'),
	app = express();

app.set('views', __dirname + '/views');
app.set('view options', {layout: false});
app.set('view engine', 'html');
app.use("/assets", express.static(__dirname + '/assets'));
app.engine('html', engines.hogan);

app.get('/', function(req, res){
    res.render('index', {
     what: 'World'
   });
});

app.listen(3000);
console.log('Express server started on port %s', 3000);