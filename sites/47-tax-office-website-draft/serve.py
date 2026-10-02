# ローカル確認用サーバー（キャッシュ無効）: python serve.py → http://localhost:8000/
import http.server, os

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))
http.server.ThreadingHTTPServer(("", 8000), NoCache).serve_forever()
