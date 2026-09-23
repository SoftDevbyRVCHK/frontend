# -*- coding: windows-1251 -*-
import io
from tkinter import Tk, Canvas
from tkinter.filedialog import askopenfilename, asksaveasfilename
from PIL import Image, ImageTk
from math import sin, cos, pi, ceil

master = Tk()

phase = 0
mode = "Floor"
last = None

global_move = 0, 0


im = Image.open(askopenfilename(filetypes=[("Images", ["*.png", "*.jpg", "*.jpeg", "*.bmp", "*.svg"])], initialdir="."))
filename = im.filename
w, h = im.size
nw, nh = ceil(w/32), ceil(h/32)
start_list = list()

for x in range(1, nw):
    start_list.append((x, 0))
for y in range(1, nh):
    start_list.append((nw-1, y))
for x in range(nw-2, -1, -1):
    start_list.append((x, nh-1))
for y in range(nh-2, -1, -1):
    start_list.append((0, y))

print(start_list)

k = min(600/(8*32), 640/(8*32))
im = im.resize((round(w*k), round(h*k)))
w, h = im.size
imtk = ImageTk.PhotoImage(im)

print(open("floor2-2.png", 'rb').read())

data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00 \x00\x00\x00 ' \
       b'\x08\x06\x00\x00\x00szz\xf4\x00\x00\x00\x84IDATx\x9c\xedT9\x0e\xc00\x08+U\x1f\xcb\x93xl\x86N\x95H\xe4\x1e' \
       b'\x03P\x06{\x8a\x8c\x89,aYTul?\xe2@\xa4\x99M<2\x19\xa5\xd9\xdf\x96\x10\x17\xa5\x81\x06\x90\xcb\x95\x8b\xd2L' \
       b'\x06\xbc;/\xf4\xef\x0c\x8d\xa8\xea\xb8[' \
       b'\xf2\xc8\xd2\xf4\xcb@5z\x84\xf0\x1a\xacAA7\x8d\xd6Hf\xc9\xb0\x88\xbe\xfc\xcd"\xea\x97\x81j\xf4\x08!\x8b\xe8i' \
       b'\tq,\xa2H\r\x8b\x88E\xc4"\xea\x17\xc2\xea\x0c\xc0\x13T\xe2\x04W\xd8\xacZ\x8f"\x13\xd2\x00\x00\x00\x00IEND' \
       b'\xaeB`\x82'

im2 = Image.open(io.BytesIO(data))
im2 = im2.resize((round(32*k), round(32*k)))
im2tk = ImageTk.PhotoImage(im2)

canvas = Canvas(width=32*8*k+4, height=32*8*k+4)
canvas.grid(column=0, row=0)

canvas2 = Canvas(width=200, height=32*8*k+4, background='gray')
canvas2.grid(column=1, row=0)

master.update()
master.wm_resizable(False, False)

LAY1 = canvas.create_image(2, 2, anchor='nw', image=imtk, tags=['flat'])

matrix = [[[False, False, False, 0] for i in range(8)] for j in range(8)]


y = 2
while y < 9*32*k:
    canvas.create_line(0, y, 8*32*k+4, y, width=2, tags=['coord'])
    y += 32 * k


x = 2
while x < 9*32*k:
    canvas.create_line(x, 0, x, 8*32*k+4, width=2, tags=['coord'])
    x += 32 * k


LAY2 = canvas.create_text(0, 0, text='', tags=['coord'])
LAY3 = canvas.create_text(0, 0, text='', tags=['coord'])


def click(event):
    global mode, last
    if mode == "Floor":
        x, y = int(event.x/32/k)-global_move[0], int(event.y/32/k)-global_move[1]
        if x >= nw or y >= nh:
            return
        if x < 0 or y < 0:
            return
        matrix[y][x][2] = not matrix[y][x][2]
        if matrix[y][x][2]:
            c = canvas.create_image((x+global_move[0])*32*k+2, (y+global_move[1])*32*k+2,
                                    image=im2tk, anchor="nw", tags=[f"{x}/{y}", "flat", "flatF"])
            canvas.lift(c, LAY2)
        else:
            canvas.delete(f"{x}/{y}")
        last = (x+global_move[0], y+global_move[1])
    elif mode == "Change":
        if "changer" not in canvas.gettags(canvas.find_closest(event.x, event.y)[0]):
            canvas.delete("changer")
            mode = "Floor"
    elif mode == "Pins":
        x, y = int(event.x / 32 / k) - global_move[0], int(event.y / 32 / k) - global_move[1]
        if x >= nw or y >= nh:
            return
        if x < 0 or y < 0:
            return
        if matrix[y][x][0] != matrix[y][x][1]:
            return
        matrix[y][x][0] = not matrix[y][x][0]
        if matrix[y][x][0]:
            matrix[y][x][1] = True
            c = canvas.create_rectangle((x + global_move[0]) * 32 * k+2, (y + global_move[1]) * 32 * k+2,
                                        (x + global_move[0]+1) * 32 * k+2, (y + global_move[1]+1) * 32 * k+2,
                                        tags=[f"P{x}/{y}", 'flat', "flatF"], fill='Blue', stipple="gray75", outline='')
            canvas.lift(c, LAY1)
        else:
            matrix[y][x][1] = False
            canvas.delete(f"P{x}/{y}")
        last = (x + global_move[0], y + global_move[1])


def click_move(event):
    x, y = int(event.x / 32 / k), int(event.y / 32 / k)
    if (x, y) != last:
        click(event)


def update():
    global phase
    d = list(filter(lambda a: matrix[a[1]][a[0]][2], map(lambda p: (p[0], p[1]), start_list)))

    def next(x, y, tm):
        if matrix[y][x][2]:
            if (x, y) in mass.keys():
                if mass[(x, y)] < tm:
                    return
            mass[(x, y)] = tm
            for mv in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                dx, dy = mv
                if 0 <= x + dx < 8 and 0 <= y + dy < 8:
                    next(x+dx, y+dy, tm+50)

    mass = {}
    if d:
        phase %= len(d)
        x, y = d[phase]
        x, y = x, y
        mass[(x, y)] = 0
        tm = 0
        next(x, y, tm)
        phase += 1

        for (x, y) in mass.keys():
            el = matrix[y][x]

            def create(x, y, tm=0, col="green"):
                def connect():
                    nonlocal x, y
                    x, y = x + global_move[0]*32*k, y + global_move[1]*32*k
                    tg = canvas.create_rectangle(x+2, y+2, x + 32 * k+2, y + 32 * k+2,
                                                 fill=col, stipple='gray50', outline='')
                    canvas.after(150, lambda: canvas.delete(tg))

                canvas.after(tm, connect)

            if el[2]:
                create(x*32*k, y*32*k, mass[(x, y)])
                # create(x * 32 * k, y * 32 * k, 2*mxtm-mass[(x, y)]+50, "blue")

    master.after(1500, update)


def close_mode(code, x, y):
    global mode
    x -= global_move[0]
    y -= global_move[1]
    matrix[y][x][3] = code
    tag = f"t{x}/{y}"
    x += 0.5 + global_move[0]
    y += 0.5 + global_move[1]
    canvas.delete(tag)
    col = "DarkRed" if code == 31 else "purple" if code > 28 else "red" if code > 24 else "green" if code > 16 else "blue"
    if code > 0:
        c0 = canvas.create_rectangle(x*32*k-7*k+2, y*32*k-7*k+2, x*32*k+7*k+2, y*32*k+7*k+2,
                                     tags=[tag, 'flat', "flatF"], fill='white')
        canvas.lift(c0, LAY3)
        c = canvas.create_text(x*32*k+2, y*32*k+2, text=code, anchor='center', fill=col, font=(32*k),
                               tags=[tag, 'flat', "flatF"])
        canvas.lift(c, c0)
    canvas.delete('changer')
    mode = "Floor"


def selector(event, x, y, tag):
    if tag == "Universal":
        return canvas.after(100, lambda: close_mode(31, int(x - 0.5), int(y - 0.5)))
    canvas.delete('changer')
    canvas.create_oval(x * 32 * k - 100+2, y * 32 * k - 100+2, x * 32 * k + 100+2, y * 32 * k + 100+2, tags=["changer"],
                       fill='white', width=3)
    count = 16 if tag == "Energy" else 8 if tag == "Connect" else 4 if tag == "Power" else 2
    st = 1 if tag == "Energy" else 17 if tag == "Connect" else 25 if tag == "Power" else 29
    for i in range(count):
        code = st+i
        dx, dy = 65 * cos(i/count*2*pi), 65 * sin(i/count*2*pi)
        canvas.create_oval(x * 32 * k+dx-10, y * 32 * k+dy-10, x * 32 * k+dx+10, y * 32 * k+dy+10,
                           tags=[f"f{code}", "changer"])
        col = "purple" if code > 28 else "red" if code > 24 else "green" if code > 16 else "blue"
        canvas.create_text(x * 32 * k+dx, y * 32 * k+dy, text=code, fill=col, tags=[f"f{code}", "changer"])

        def connect():
            cd = code

            def func(event):
                canvas.after(100, lambda: close_mode(cd, int(x - 0.5), int(y - 0.5)))

            canvas.tag_bind(f"f{code}", "<Button 1>", func)

        connect()
    if event.y < 100:
        canvas.move("changer", 0, 100)
    if event.y > 32*8*k-100:
        canvas.move("changer", 0, -100)

    if event.x < 100:
        canvas.move("changer", 100, 0)
    if event.x > 32*8*k-100:
        canvas.move("changer", -100, 0)


def change_mode(event):
    global mode
    if mode not in ["Floor", "Change"]:
        x, y = int(event.x / 32 / k) - global_move[0], int(event.y / 32 / k) - global_move[1]
        if event.x >= 8*32*k+4 or event.y >= 8*32*k+4:
            return
        if event.x < 2 or event.y < 2:
            return
        if matrix[y][x][0]:
            return
        matrix[y][x][1] = not matrix[y][x][1]
        if matrix[y][x][1]:
            c = canvas.create_rectangle((x + global_move[0]) * 32 * k+2, (y + global_move[1]) * 32 * k+2,
                                        (x + global_move[0] + 1) * 32 * k+2, (y + global_move[1] + 1) * 32 * k+2,
                                        tags=[f"P{x}/{y}", 'flat', "flatF"], fill='red', stipple="gray25", outline='')
            canvas.lift(c, LAY1)
        else:
            canvas.delete(f"P{x}/{y}")
        return
    canvas.delete('changer')
    mode = "Change"
    x, y = int(event.x / 32 / k)+0.5, int(event.y / 32 / k)+0.5
    canvas.create_oval(x*32*k-100, y*32*k-100, x*32*k+100, y*32*k+100, tags=["changer"], fill='white', width=3)
    canvas.create_line(x*32*k-71, y*32*k-71, x*32*k+71, y*32*k+71, tags=["changer"], fill='black', width=3)
    canvas.create_line(x * 32 * k - 71, y * 32 * k + 71, x * 32 * k + 71, y * 32 * k - 71, tags=["changer"],
                       fill='black', width=3)
    canvas.create_oval(x * 32 * k - 30, y * 32 * k - 30, x * 32 * k + 30, y * 32 * k + 30,
                       tags=["changer", "Universal"], fill='white', width=3)
    canvas.create_text(x * 32 * k, y * 32 * k, anchor='center',  tags=["changer", "Universal"],
                       fill="DarkRed", text="O", font=(40))
    canvas.create_oval(x * 32 * k - 30, y * 32 * k + 35, x * 32 * k + 30, y * 32 * k + 95,
                       tags=["changer", "Epic"], fill='white', width=3)
    canvas.create_text(x * 32 * k, y * 32 * k + 65, anchor='center', tags=["changer", "Epic"],
                       fill="purple", text="+", font=(40))
    canvas.create_oval(x * 32 * k - 30, y * 32 * k - 35, x * 32 * k + 30, y * 32 * k - 95,
                       tags=["changer", "Energy"], fill='white', width=3)
    canvas.create_text(x * 32 * k, y * 32 * k - 65, anchor='center', tags=["changer", "Energy"],
                       fill="blue", text="¤", font=(40))
    canvas.create_oval(x * 32 * k - 95, y * 32 * k - 30, x * 32 * k - 35, y * 32 * k + 30,
                       tags=["changer", "Connect"], fill='white', width=3)
    canvas.create_text(x * 32 * k-65, y * 32 * k, anchor='center', tags=["changer", "Connect"],
                       fill="green", text="*", font=(40))
    canvas.create_oval(x * 32 * k + 95, y * 32 * k - 30, x * 32 * k + 35, y * 32 * k + 30,
                       tags=["changer", "Power"], fill='white', width=3)
    canvas.create_text(x * 32 * k + 65, y * 32 * k, anchor='center', tags=["changer", "Power"],
                       fill="red", text="^", font=(40))

    c = canvas.create_rectangle(x*32*k+51, y*32*k-51, x*32*k+71, y*32*k-71, tags=["changer"], fill='white')
    canvas.tag_bind(c, '<Button 1>', lambda ev: canvas.after(100, lambda: close_mode(0, int(x-0.5), int(y-0.5))))

    canvas.move("changer", 2, 2)
    if event.y < 100:
        canvas.move("changer", 0, 100)
    if event.y > 32*8*k-100:
        canvas.move("changer", 0, -100)

    if event.x < 100:
        canvas.move("changer", 100, 0)
    if event.x > 32*8*k-100:
        canvas.move("changer", -100, 0)

    for tg in ["Universal", "Energy", "Connect", "Power", "Epic"]:
        def connect():
            nonlocal tg
            tx = tg

            def func(ev):
                selector(event, x, y, tx)

            canvas.tag_bind(tg, "<Button 1>", func)

        connect()


def move(dx, dy):
    global global_move
    dx1, dy1 = global_move
    if 0 <= dx1+dx <= 8-nw and 0 <= dy1+dy <= 8-nh:
        global_move = dx1+dx, dy1+dy
        canvas.move('flat', dx*32*k, dy*32*k)
        # canvas.move('coord', -dx*32*k, -dy*32*k)
        for el in canvas.find_all():
            x, y, *_ = canvas.coords(el)
            if x > 32*8*k or y > 32*8*k or x < 0 or y < 0:
                canvas.delete(el)


def change_mode2(event):
    global mode
    canvas.delete('changer')
    if mode in ["Floor", "Change"]:
        mode = "Pins"
        canvas2.itemconfigure(canvas2.find_withtag("MODE")[1], text='Mode: Pins&Spaces')
    elif mode == "Pins":
        mode = "Floor"
        canvas2.itemconfigure(canvas2.find_withtag("MODE")[1], text='Mode: Floors&Labels')


def save(event):
    f = asksaveasfilename(filetypes=[("Save", "*.txt")], initialdir="data/")
    if f:
        with open(f, "wb") as file:
            file.write(bytes(filename+'\n', "utf-8"))
            string = (global_move[0])*16+(global_move[1])
            file.write(string.to_bytes(1, "big"))
            for line in matrix:
                for el in line:
                    f1, f2, f3, lb = el
                    string = (f1*128+f2*64+f3*32+lb)
                    file.write(string.to_bytes(1, "big"))


def load(event):
    global filename, global_move, im, imtk, mode, nw, nh, start_list
    f = askopenfilename(filetypes=[("Save", "*.txt")], initialdir="data/")
    if f:
        with open(f, "rb") as file:
            canvas.delete('flatF')
            canvas.delete('changer')
            filename = file.readline().decode("utf-8").strip()
            im = Image.open(filename)
            w, h = im.size
            nw, nh = ceil(w / 32), ceil(h / 32)

            start_list = list()

            for x in range(1, nw):
                start_list.append((x, 0))
            for y in range(1, nh):
                start_list.append((nw - 1, y))
            for x in range(nw - 2, -1, -1):
                start_list.append((x, nh - 1))
            for y in range(nh - 2, -1, -1):
                start_list.append((0, y))
            im = im.resize((round(w*k), round(h*k)))
            imtk = ImageTk.PhotoImage(im)
            canvas.itemconfigure(LAY1, image=imtk)

            i = int.from_bytes(file.read(1), 'big')
            dy = i % 16
            dx = (i-dy)//16
            global_move = dx, dy

            canvas.coords(LAY1, 2+global_move[0]*32*k, 2+global_move[1]*32*k)

            for y in range(8):
                for x in range(8):
                    i = int.from_bytes(file.read(1), 'big')
                    print(i)
                    f1 = i >= 128
                    f2 = (i - 128 * f1) >= 64
                    f3 = (i-128*f1-64*f2) >= 32
                    lb = (i-128*f1-64*f2 - 32 * f3)
                    matrix[y][x] = [False, False, False, 0]
                    event.x, event.y = (x+global_move[0]) * 32 * k +2, (y+global_move[1]) * 32 * k+2
                    if f3:
                        mode = "Floor"
                        click(event)
                    if f2 and not f1:
                        mode = "Pins"
                        change_mode(event)
                    if f2 and f1:
                        mode = "Pins"
                        click(event)
                    if lb:
                        close_mode(lb, x+global_move[0], y+global_move[1])
            mode = "Floor"
            canvas2.itemconfigure(canvas2.find_withtag("MODE")[1], text='Mode: Floors&Labels')


def new(event):
    global filename, global_move, im, imtk, mode, nw, nh, start_list, matrix
    filename = askopenfilename(filetypes=[("Images", ["*.png", "*.jpg", "*.jpeg", "*.bmp", "*.svg"])], initialdir='.')
    if filename:
        canvas.delete('flatF')
        canvas.delete('changer')
        im = Image.open(filename)
        w, h = im.size
        nw, nh = ceil(w / 32), ceil(h / 32)

        start_list = list()

        for x in range(1, nw):
            start_list.append((x, 0))
        for y in range(1, nh):
            start_list.append((nw - 1, y))
        for x in range(nw - 2, -1, -1):
            start_list.append((x, nh - 1))
        for y in range(nh - 2, -1, -1):
            start_list.append((0, y))
        im = im.resize((round(w * k), round(h * k)))
        imtk = ImageTk.PhotoImage(im)
        canvas.itemconfigure(LAY1, image=imtk)
        canvas.coords(LAY1, 2, 2)

        matrix = [[[False, False, False, 0] for i in range(8)] for j in range(8)]
        mode = "Floor"
        canvas2.itemconfigure(canvas2.find_withtag("MODE")[1], text='Mode: Floors&Labels')
        global_move = (0, 0)


c = canvas2.create_line(10, 32*6*k, 80, 32*6*k, width=8, arrow="first")
canvas2.tag_bind(c, '<Button 1>', lambda ev: move(-1, 0))

c = canvas2.create_line(120, 32*6*k, 190, 32*6*k, width=8, arrow="last")
canvas2.tag_bind(c, '<Button 1>', lambda ev: move(1, 0))

c = canvas2.create_line(100, 32*5*k, 100, 32*6*k-20, width=8, arrow="first")
canvas2.tag_bind(c, '<Button 1>', lambda ev: move(0, -1))

c = canvas2.create_line(100, 32*6*k+20, 100, 32*7*k, width=8, arrow="last")
canvas2.tag_bind(c, '<Button 1>', lambda ev: move(0, 1))


canvas2.create_rectangle(10, 10*k, 190, 34*k, fill='white', tags=["MODE"])
canvas2.create_text(100, 22*k, anchor='center', text="Mode: Floors&Labels", tags=["MODE"])


canvas2.create_rectangle(10, 42*k, 190, 66*k, fill='white', tags=["NEW"])
canvas2.create_text(100, 54*k, anchor='center', text="NEW", tags=["NEW"])

canvas2.create_rectangle(10, 68*k, 190, 92*k, fill='white', tags=["LOAD"])
canvas2.create_text(100, 80*k, anchor='center', text="LOAD", tags=["LOAD"])

canvas2.create_rectangle(10, 94*k, 190, 118*k, fill='white', tags=["SAVE"])
canvas2.create_text(100, 106*k, anchor='center', text="SAVE", tags=["SAVE"])

canvas2.tag_bind("MODE", "<Button 1>", change_mode2)
canvas2.tag_bind("NEW", "<Button 1>", new)
canvas2.tag_bind("SAVE", "<Button 1>", save)
canvas2.tag_bind("LOAD", "<Button 1>", load)

update()

canvas.bind('<Button 1>', click)
canvas.bind('<B1-Motion>', click_move)
canvas.bind('<Button 3>', change_mode)
master.mainloop()
