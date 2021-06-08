const express = require('express');
const router = express.Router();
const template = require('../lib/template');

// index
router.get('/', function(request, response){ // get 방식
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
        `
        <h2>${title}</h2>${description}
        <img src="images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
        `, // img 정적 파일 불러오긴
        `<a href="/topic/create">create</a>`
    );
    response.send(html);
});

module.exports = router;