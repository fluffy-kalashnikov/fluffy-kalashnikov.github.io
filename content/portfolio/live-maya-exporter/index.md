+++
title = 'Live Maya Exporter'
weight = 2
summary = '''
'''
tags = []
date = 2025-01-03
draft = false
+++
# Live Maya Exporter
I created a Maya plugin that lets the user seamlessly update models while the game is running simultaneuosly. I'm very grateful to [Alvin Andersson Eriksson](www.alvineriksson.com) for letting me modify the game engines asset manager to fit my needs!

{{< fakegif "live_maya_exporter_showcase.webm" >}}

Since I studied game programming extensively before I dove into technical art I've been very interested in finding unique ways to apply my previous experience for pipeline development. Inspired by the networking course at The Game Assembly, I wanted to create a tool that communicates between processes!

The exporter works by letting an instance of Maya act as a server and the game instances as clients. When the user presses a keybind, Maya exports the current scene to a temporary directory and notifies all connected game instances that a particular model needs to be reloaded. The game clients subsequently searches for the most suitable model to update and imports the file Maya requested. Voilà!


## Implementation
The networking parts of the tool is implemented as a static library that is used by the Maya server and the game clients. I structured it this way to make the library easier to develop and test against, and I choose to use [CMake](https://cmake.org/) as the build system to provide convenience custom targets for playtesting. It's also required to build the Maya plugin as only a CMake module is provided officially from the [Maya DevKit SDK](https://aps.autodesk.com/developer/overview/maya).

{{< fakegif "live-maya-exporter-playtest.webm" >}}

The networking itself is very simplified as it is assumed to be local. Both the server and the clients keeps track of their own individual list of connections. If the clients doesn't have any connections, it sends a connection request to localhost:27015. If a server is running it responds with an acknowledgement and keeps track of the newly added connection. The connection list is then used by the server to broadcast messages to all connected clients.

{{< fakegif "live-maya-exporter-reconnecting.webm" >}}

However, it regularly happens that the server and the clients disconnect themselves. Common examples of this is when you restart Maya or playtest inside of our custom game engine, in which case a new instance will be launched every time you press play. This is handled by pinging between the server and the clients at regular intervals to maintain the list of active connections. A client is disconnected within a matter of seconds and can even disconnect itself by blocking the main thread with something as simple as a scene load, but this isn't an issue as reconnection happens just as fast.

## If I had more time
If I had more time the first thing I would like to add is a Python backend so that it could be implemented in Blender, Substance Designer, Unreal Engine or almost any application really with a modern Python interpreter and plugin architecture. I also think it would be interesting to implement actions sent from the game back to Maya. Things like clicking a model in the level and opening the corresponding source file inside of Maya could be very useful!

Something that would be really elegant is the creation of a standalone server application that lets both games and different editors connect simultaneuosly, acting as a bridge for the entire content pipeline. One could create a unified source file viewer with Houdini, Maya, Blender, ZBrush, Photoshop, Substance, Unreal Engine all integrated into something similar as the Steam overlay.