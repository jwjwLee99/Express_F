//Express
const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');
const indexRouter = require('./routes/index.js'); // index.js 불러오기
const topicRouter = require('./routes/topic.js'); // topic.js 불러오기


app.use(express.static('public')); //정적이 파일 불러오기
app.use(bodyParser.urlencoded({ extended: false })); // body-parser 호출
// post 방식으로 전송된 form 데이터를 쉽게 가져오는 기능
app.use(compression()); // compression 호출
// 컨텐츠를 압축해서 전송하는 기능
app.get('*', function(request, response, next){ // 미들웨어(글 목록 읽어오기 , get 방식 요청에만 작동)
  fs.readdir('./data', function(err, filelist){
    request.list = filelist;
    next();
  });
});

app.use('/', indexRouter); // index.js 사용
app.use('/topic', topicRouter); // topic.js 사용

// 404 error
app.use(function(request, response, next){ // page not found
  response.status(404).send('Sorry cant find that!');
});

// 500 error
app.use(function(err, request, response, next){ // 404 위에다 쓰면 안된다. 왜?? // internal system error
  console.log(err.stack);
  response.status(500).send('Somthing broke!');
});

// localhost:3000
app.listen(3000, function(){
  console.log("Example app listening on port 3000");
});

/*
var express = require('express');
var app = express();

// 1번 미들웨어
app.use(function(request,response,next){
if(~) next('route');
else next();
},
// 2번 미들웨어
function(function(request,response,next){
response.send("~");
});
// 3번 미들웨어
app.use(function(request,response,next){
response.send("~");
});

$ true => 3번 미들웨어로 이동
$ false => 2번 미들웨어로 이동
*/

/* Express example
const express = require('express') // express module 불러오기 // const 상수 선언 - 재활당 불가, 다시 선언불가
const app = express() // express를 함수처럼 호출
 
app.get('/', (req, res) => res.send('Hello World!'))
// app.get(path, callback [, callback ...])
// route, routing
==
app.get('/', function(req, res){
  return res.send('Hello World!');
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
*/

/* basic code
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      } else {
        fs.readdir('./data', function(error, filelist){
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1']
            });
            var list = template.list(filelist);
            var html = template.HTML(sanitizedTitle, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              ` <a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
      });
    } else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();
            })
          });
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          fs.unlink(`data/${filteredId}`, function(error){
            response.writeHead(302, {Location: `/`});
            response.end();
          })
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
*/
