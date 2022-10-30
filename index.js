var http = require('http');
var server = http.createServer(function(request, response){
    response.writeHead(200,{'Content-Type': 'text/html; charset=utf-8'});
    response.end('<h1><span id="hello">Hello World</span></h1>');
})
server.listen(8080);
console.log(require('os').hostname(), 8080)
