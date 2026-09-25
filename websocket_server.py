# -*- coding: windows-1251 -*-
import asyncio
import websockets
# import json


data = {"solar.png": {"a": 0, "e": 0, "s": 0, "t":0, "n":0, "G": 100}, "earth.png": {"a": 250, "e": 0.017, "s": 0.001, "t": 0, "n":0, "G": 10},
        "pluto.png": {"a": 17.8*250, "e": 0.967, "s": 0.001, "t": (162+3/60)/180*3.14, "n":45, "G": 0}}

# json.dump(data, open("html/data/objects/systemD11RA.json", "w"), indent=4)


async def handler(websocket, path=''):
    async for message in websocket:
        if message == "Reload":
            with open("html/data/objects/systemD11RA.json") as f:
                await websocket.send(f'{f.read()}')


async def main():
    server = await websockets.serve(handler, "localhost", 8765)
    print("Сервер запущен на ws://localhost:8765")
    await server.wait_closed()


if __name__ == "__main__":
    asyncio.run(main())