# 編集確認用のローカルサーバー（キャッシュ無効）
# 使い方: このフォルダで  python serve.py  を実行し、http://127.0.0.1:8080/Top.dc.html を開く
import functools
import http.server
import os

PORT = 8080


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


if __name__ == "__main__":
    root = os.path.dirname(os.path.abspath(__file__))
    handler = functools.partial(NoCacheHandler, directory=root)
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
        print(f"http://127.0.0.1:{PORT}/Top.dc.html")
        httpd.serve_forever()
