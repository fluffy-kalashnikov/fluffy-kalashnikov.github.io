+++
title = 'Live Maya Exporter'
summary = '''
'''
tags = []
date = 2025-01-03
draft = false
+++
I created a Maya plugin that lets the user seamlessly update models while the game is running simultaneuosly. I'm very grateful to [Alvin Andersson Eriksson](www.alvineriksson.com) for letting me modify the game engines asset manager to fit my peculiar needs!

{{< fakegif "live-maya-exporter-showcase.webm" >}}

Since I studied game programming extensively before I dove into technical art I've been very interested at finding unique ways to apply my previous experience for pipeline development. Inspired by the networking course at The Game Assembly, I wanted to create a tool that communicates between processes!

The exporter roughly works by letting an instance of Maya act as a server and the game instances as clients. When the user presses a keybind, Maya exports the current scene to a temporary directory and notifies all connected game instances that a particular model needs to be reloaded. The game clients subsequently searches for the most suitable model to update and imports the file Maya requested. Voilà!

{{< tableofcontents >}}

## Implementing the networking library
### CMake
### Python bindings
### Maya DevKit SDK
### Playtesting with server/clients

## If I had more time
If I had more time the first thing I would do is to create a general Python backend so that it could be implemented in Blender, Substance Designer, Unreal Engine and almost any application really with a modern builtin Python interpreter and plugin architecture.

I've also considered changing the client-server architecture so that multiple games and editors can coexist with a single server application running in the background.