const http = require('http');
const fs = require('fs');
const path = require('path');

const TARGET_FILE = path.join(__dirname, 'index.html');
const PORT = 3000;

const server = http.createServer((req, res) => {
    // Set CORS headers so the browser can talk to this server
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/save') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                fs.writeFileSync(TARGET_FILE, body);
                console.log('Successfully updated index.html');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success' }));
            } catch (err) {
                console.error('Error writing file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: err.message }));
            }
        });
    } else if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
        fs.readFile(TARGET_FILE, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Save Server running at http://localhost:${PORT}`);
    console.log(`Watching for saves to: ${TARGET_FILE}`);
});
