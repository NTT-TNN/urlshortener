const express = require('express');
const path = require('path');
const mongo = require('mongodb');
require('dotenv').config({
  silent: true
});
var cnt=1;
var short="http://localhost:3500/";
var app=express();
var u="mongodb://nguyentienthao:lebaochi1809@ds057066.mlab.com:57066/urlshortenner";

var port=process.env.PORT||3500;

mongo.MongoClient.connect(u,function(err,db){
  if(err) throw err;
  else {
    console.log("Successfully connected to MongoDB on port 27017.");
  }


db.createCollection("webs",{
  capped:true,
  size:5242880,
  max:10000
})
// Checks to see if it is an actual url
// Regex from https://gist.github.com/dperini/729294
function ValidURL(url) {
  var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  return regex.test(url);
 }

app.get('/',function(req,res){
  var fileName=path.join(__dirname,"index.html");
  res.sendFile(fileName,function(err){
    if(err) throw err;
    console.log("Sent file index.html success!");
  })
})
app.get('/new/:url*',function(req,res){
  console.log(process.env.APP_URL);
    var Obj={};
    var url=req.url.slice(5)
    if(ValidURL(url)){
      Obj={
        "original_url":url,
        "short_url":short+cnt
      }
        cnt++;
      res.send(Obj);
      var web=db.collection("webs");
      web.save(Obj,function(err,f){
        if(err) throw err;
        else console.log("Da luu "+f);
      })
    }else{
      Obj={"error": "Wrong url format, make sure you have a valid protocol and real site."};
        res.send(Obj);
    }
})
app.get('/:url',function(req,res){
  var url=short+req.params.url;
  findURL(url,db,res);
})

function findURL(link,db,res){
  console.log("tim link");
    var web=db.collection("webs");
    web.findOne({"short_url":link},function(err,result){
      if(err) throw err;
      if(result){
        console.log("Tim thay"+result);
        console.log("Redirecting to "+result.original_url);
        res.redirect(result.original_url);
      }
    else{
      res.send({ "error": "This url is not on the database."});

  }
});
}


});
app.listen(port,function(){
  console.log("App running at "+port);
});
