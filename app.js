var express = require("express")
var bodyParser = require("body-parser")
var exec = require('child_process').exec;
var multer = require('multer')
var path = require('path')
var fs = require('fs')

var upload = multer({dest: 'uploads/'})

var app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : false}))

app.get("/", function(req, res){
  res.redirect("/form");
})

app.get("/form", function(req, res, next){
  res.render("form")
})

app.post("/form", upload.single('code'), function(req, res, next){
  if(req.file){
    var i_name = req.file.path + ".cpp"
    var o_name = req.file.path + ".out"
    exec("mv " + req.file.path + " " + i_name, function(){
      exec("g++ -o " + o_name + " " + i_name, function (error, stdout, stder){
        if(handleOutput(res, error, stder)){
          exec("./" + o_name, { timeout : 3000 },  function (error_2, stdout_2, stder_2){
            if(handleOutput(res, error_2, stder_2))
            {
              res.status(200).send(stdout_2)
            }
            fs.unlinkSync(o_name);
            fs.unlinkSync(i_name);
          })
        }
      })
    })
  }else{
    res.status(400).send("Nenhum arquivo foi recebido")
  }
})

function handleOutput(res, error, stder) {
  if(error || stder){
    res.status(400).send(
      "Output error:\n" + stder + "\n" +
      "Error:\n" + error + "\n")
    return false;
  }else{
    return true;
  }
}

var server = app.listen(3000, function(){
  console.log("Exemplo rodando na porta " + server.address().port + "\n");
})
