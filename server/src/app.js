const http = require('http');

const port = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', message: 'Even Manager server is running' }));
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
