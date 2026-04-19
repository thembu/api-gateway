const http = require('http');
const proxy = require('./proxy')
const rateLimit = require('./middleware/ratelimit')
const logger = require('./middleware/logger')
require('dotenv').config()

const PORT = process.env.PORT || 3001;

const server = http.createServer( async (req , res) => {

   const start = Date.now();
   

//capture ip address for rate limiting and logging
const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

//checks if the ip is allowed to make the request based on the rate limit
const allowed = await rateLimit(ip)

//if not allowed, send a 429 response and log the request
if(!allowed) {
    res.writeHead(429 , {'Content-Type' : 'application/json'})
    res.end(JSON.stringify({ error: 'Too many requests' }))

    const duration = Date.now() - start;

    //log the blocked request
    await logger({method : req.method ,  path : req.path , status : 429 , ip,blocked : true, duration})
    return
}

//forward the request to the appropriate microservice and log the response status code  

proxy(req , res , async (statusCode) => {
    const duration = Date.now() - start;
    await logger({method : req.method ,  path : req.path , status : statusCode , ip,blocked : false, duration})   

})

})
server.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
})




