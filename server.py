# -*- coding: windows-1251 -*-
from http.server import HTTPServer, BaseHTTPRequestHandler
import mimetypes
from random import randint

rects = []

site = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Client?</title>
</head>
<body>
<canvas id="field" width="800" height="600"></canvas>
<script>
  const field = document.getElementById("field");
  const context = field.getContext('2d');
  const AndreyUrl = "http://localhost:8000";

  context.strokeRect(2, 2, 800-2, 600-2);

  const xhr0 = new XMLHttpRequest();
  xhr0.open("GET", AndreyUrl+"/Id", false);
  xhr0.send();

  const Id = xhr0.responseText;


  /*xhr0.open("POST", AndreyUrl+"/create?id="+Id, false);
  xhr0.send();*/

  function click(event){
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", AndreyUrl+"/rect?id="+Id+"&x="+event.x+"&y="+event.y);
      xhr.send();
      }

  function update() {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", AndreyUrl+"/rects");
      xhr.onload = () => {
          context.clearRect(3, 3, 800-6, 600-6);
          for (let line of xhr.responseText.split("\n")) {
            let x = parseInt(line.split(";")[0]); let y = parseInt(line.split(";")[1]); let col = line.split(";")[2];
            context.strokeStyle = col;
            context.strokeRect(x, y, 100, 100);
          }
      }
      xhr.send();
      setTimeout(update, 300);
  }

update();
document.body.addEventListener("click", click);
window.addEventListener('beforeunload', (event) => {
  const xhr = new XMLHttpRequest();
  xhr.open("DELETE", AndreyUrl+"/rect_del?id="+Id);
  xhr.send();
});
</script>
</body>
</html>
"""


class MyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # По умолчанию будем отдавать login.html
        self.send_response(200)

        path = self.path[1:]
        if path == "":
            self.send_header("Content-type", f"text/html; charset=utf-8")
            self.end_headers()
            with open("html/test_client.html") as file:
                self.wfile.write(file.read().encode("utf-8"))
        else:
            self.send_header("Content-type", f"text/plain; charset=utf-8")
            self.end_headers()
        if path == "Id":
            self.wfile.write(f"{len(rects)}".encode("utf-8"))
            rects.append([str(randint(5, 75)*10), str(randint(5, 55)*10), "#%2X%2X%2X"%(randint(3, 25)*10, randint(3, 25)*10, randint(3, 25)*10)])
        elif path == "rects":
            self.wfile.write("\n".join(list(map(";".join, rects))).encode("utf-8"))
        # print(rects, "\n".join(list(map(";".join, rects))).encode("utf-8"))


    def do_PUT(self):
        path = self.path.split('?')
        if path:
            path = path[0][1:]
        if path == "rect":
            Id, x, y = map(lambda s: int(s.split("=")[1]), self.path.split('?')[1].split("&"))
            rect = rects[Id]
            rect[0] = str(x-50)
            rect[1] = str(y-50)

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"PUT request received!")

    def do_DELETE(self):
        path = self.path.split('?')
        if path:
            path = path[0][1:]
        if path == "rect_del":
            Id = int(self.path.split("?")[1].split("=")[1])
            rects[Id][0] = "-100"

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"DELETE request received!")


hostName = "localhost"
serverPort = 8000

# Инициализация сервера
webServer = HTTPServer((hostName, serverPort), MyHandler)
print(f"Сервер запущен: http://{hostName}:{serverPort}")

        # Бесконечный цикл прослушивания порта


try:
    webServer.serve_forever()
except KeyboardInterrupt:
    pass

webServer.server_close()
print("Сервер остановлен...")