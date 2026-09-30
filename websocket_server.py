# -*- coding: windows-1251 -*-
import asyncio
import random

import websockets
# import json


data = {"solar.png": {"a": 0, "e": 0, "s": 0, "t":0, "n":0, "G": 100}, "earth.png": {"a": 250, "e": 0.017, "s": 0.001, "t": 0, "n":0, "G": 10},
        "pluto.png": {"a": 17.8*250, "e": 0.967, "s": 0.001, "t": (162+3/60)/180*3.14, "n":45, "G": 0}}


ships = {'0': {"x": 0, "y":0, "col": "red"}}

# json.dump(data, open("html/data/objects/systemD11RA.json", "w"), indent=4)


async def handler(websocket, path=''):
    async for message in websocket:
        if message == "New":
            with open("html/data/objects/systemD11RA.json") as f:
                await websocket.send(f'{"{"}"type": "planets", "data":{f.read()}, "id": {(key:=str(max(map(int, ships.keys()))+1))}{"}"}')
                ships[key] = {"x": 0, "y": 0, "col": "#%2X%2X%2XE0"%(random.randint(3, 25)*10, random.randint(3, 25)*10, random.randint(3, 25)*10)}
                print(ships[key])

        else:
            d = eval(message)
            if d["type"] == "delete":
                ships.pop(str(d["id"]))
            elif d["type"] == "update":
                d["data"]["col"] = ships[str(d['id'])]['col']
                ships[str(d['id'])] = d['data']
                await websocket.send(f'{"{"}"type": "ships", "data": {str(ships)} {"}"}')


async def main():
    server = await websockets.serve(handler, "localhost", 8765)
    print("Сервер запущен на ws://localhost:8765")
    await server.wait_closed()


if __name__ == "__main__":
    asyncio.run(main())