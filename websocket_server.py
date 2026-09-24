# -*- coding: windows-1251 -*-
import asyncio
import websockets


data = {"solar.png": {"a": 0, "b": 0, "e": 0, "G": 100}, "earth.png": {"a": 250, "b": 250, "e": 0, "G": 10}}


async def handler(websocket, path=''):
    async for message in websocket:
        if message == "Reload":
            await websocket.send(f'{data}')


async def main():
    server = await websockets.serve(handler, "localhost", 8765)
    print("Сервер запущен на ws://localhost:8765")
    await server.wait_closed()


if __name__ == "__main__":
    asyncio.run(main())