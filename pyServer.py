#Use to create local host
import http.server
import socketserver

PORT = 1337

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
      ".js": "application/javascript",
});

socketserver.TCPServer.allow_reuse_address = True
server = socketserver.TCPServer(("", PORT), Handler)

print(f'Server running on http://localhost:{PORT}')
server.serve_forever()