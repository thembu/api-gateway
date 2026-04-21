const http = require('http');

//sfowardig to our projects express api
const UPSTREAM ={
   default : {host : 'localhost',port : 3000},
   screener : {host : 'localhost',port : 3003},
}

module.exports = function proxy(req, res , onFinish) {

 const UPSTREAM = req.url.startsWith('/api/screener') ? UPSTREAM.screener : UPSTREAM.default;


const options = {
  host: UPSTREAM.host, //where to forward the request
  port: UPSTREAM.port, //which port to forward the request
  path: req.url, //the path of the request e.g /api/jobs
  method: req.method, //the method of the request e.g GET, POST, PUT, DELETE
  headers: {
    ...req.headers, //forward the original headers to the microservice
    host: `${UPSTREAM.host}:${UPSTREAM.port}` //set the host header to the microservice's host and port
  }
};


//takes response from backend to client and logs the status code of the response to the client
const forwardReq = http.request(options, (forwardRes) => {
  res.writeHead(forwardRes.statusCode, forwardRes.headers); 
  forwardRes.pipe(res); //send body back to client

  onFinish(forwardRes.statusCode);
});


forwardReq.on('error', (err) => {
  console.error('Proxy error:', err);
  res.writeHead(502 , {'Content-Type' : 'application/json'});
  res.end(JSON.stringify({ message: 'Bad gateway' }));
  onFinish(502);
});

req.pipe(forwardReq);



}

