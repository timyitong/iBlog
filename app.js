var express = require('express')
var im=require('imagemagick')
var fs=require('fs')
var application_root = __dirname
var path = require("path")
var mongoose = require("mongoose")

var app=express()

mongoose.connect('mongodb://localhost/iblog_database')

app.configure(function (){
    app.use(express.bodyParser())
    app.use(express.methodOverride())
    app.use(app.router)
    app.use(express.static(path.join(application_root,"public")))
    app.use(express.errorHandler({dumpExceptions:true,showStack:true}))
    app.use(express.bodyParser({keepExtensions: true, uploadDir:"./public/uploads"}))
})

var Schema = mongoose.Schema
var Article= new Schema({
    title: String,
    content: String,
    ctime: {type:Date,default:Date.now},
    image: String
})
var ArticleModel = mongoose.model('Article', Article)


app.get('/api',function(req,res){
    res.send('Hellon World'+req.ip)
})
app.get('/api/articles',function(req,res){
    return ArticleModel.find().sort("-ctime").exec(function (err, articles){
        if (!err){
             res.header("Access-Control-Allow-Origin","*")
             return res.send(articles)
	} else {
		return console.log(err)
	}
    })
})
app.post('/api/articles', function (req, res){
  var article
  console.log("POST: ")
  console.log(req.body) 
  var image=''
  article= new ArticleModel({
	title: req.body.title,
	content: req.body.content,
        image: image
  })
  if (req.body.auth=="T6264"){
  if (req.files){
 
     var tmp=req.files.pic.path
     var old=req.files.pic.name
     var new_name=tmp.substring(tmp.lastIndexOf('/')+1,tmp.length)+old.substring(old.lastIndexOf('.'),old.length)
     image="./"+"uploads/"+new_name
     console.log(new_name)
     console.log(image)
     article.set({image:image})
     var new_path="public/uploads/"+new_name
     fs.rename(req.files.pic.path,new_path,function(err){
     if (err) throw err 
     fs.unlink(req.files.pic.path)
     resize_image("public/uploads/"+new_name)
     })
   }
  article.save(function (err){
    if (!err){
      return console.log("created")
    } else {
      return console.log(err)
    }
  })}
  return res.send(article)
})

function resize_image(image){
  var options={
    srcPath: image,
    dstPath: image,
    width:  500,
    quality: 0.9
  }
  im.resize(options,function(err){
    if (!err) return console.log("resized")
    else console.log(err)
  })
}

app.get('/api/articles/:id', function (req, res){
  return ArticleModel.findById(req.params.id, function (err, article){
    if (!err) {
       return res.send(article);
    } else {
      return console.log(err)
    }
  })
})

app.put('/api/articles/:id',function (req,res){
  return ArticleModel.findById(req.params.id, function (err, article){
    article.title = req.body.title
    article.content = req.body.content   
  if (req.body.auth=="T6264"){
    return article.save(function (err){
      if (!err){
        console.log("updated");
      } else{
        console.log(err);
      }
      return res.send(article)
    })
  }else{
     return res.sent("no authentification")
  }
  })
})

app.delete('/api/articles/:id', function (req, res){
  if (req.body.auth=="T6264"){
  return ArticleModel.findById(req.params.id, function (err, article){
   return article.remove(function(err){
     if (!err){
       console.log("removed")
       return res.send('')
     } else {
       console.log(err)
     }
   })
  })
  }else {return res.send('no authentification')}
})
//bulk action:
app.delete('/api/articles',function(req,res){
  if (req.body.auth=="T6264"){
  ArticleModel.remove(function(err){
    if (!err){
      console.log("removed");
      return res.send('')
     } else {
       console.log(err)
     }
   })
  }else{return res.send('no authentification')}
})

app.listen(3000);
console.log("Listening on port 300")

