+++
title = 'Tech Art Communications Library'
summary = '''

'''
tags = ['C++', 'cmake]
date = 2024-01-07T18:58:06+01:00
draft = false
screenshot = '/portfolio/pcg-with-houdini/thumbnail.webp'
credits = [
    'Ivar Sidorsson'
]
+++

The Tech Art Communications Library is a C++ library I built to enable my tools to communicate with external processes/games playing in the background.

# Demo
# The problem
# File Watchers vs Networking 
My goal was to create a live reload function inside a running game from Maya. I have since earlier automatically reloaded assets through file watchers in earlier game projects, but they are limited in what they can do and naive implementations (i.e. mine) can be very performance intensive. I have some previous experience with networking and wanted to create a reusable C++ library that could be integrated inside of Maya or Blender, and thought that a networking library could provide interesting functionality not  possible to integrate otherwise.

## File Watchers (polling)
* Really slow naive implementation
* Polling does not scale well
* Cannot provide extra information for commands
## Window Messages (event driven)
* Requires access window message pump for external applications (i.e. Maya, Blender)
* Platform-specific behaviour 
* ~~Difficult to send large amounts of data~~ can send large amounts of data using WM_COPYDATA
## Networking (event driven)
* Can be designed cross-platform
* Can even communicate across devices
* Can have multiple simultaneous connections over LAN on different ports

# How libtacom works
The libtacom library is integrated and initialized in client mode for games and server mode for editors, where Autodesk Maya 2025 was the first editor I integrated with. While the clients are unconnected they send connection requests at intervals until the server recieves their requests and sends an acknowledgement back to the clients. When everything has connected the server/editor is free to send commands for the clients to execute, where reloading an asset live is the first implemented example.

The reload asset commands exports the current Maya scene into a temporary FBX file. It then sends the name of the scene along with the path to the newly exported FBX to all running instances of the game. The game uses the name of the scene to search for models sharing the same name, and there's only a single match the loaded model is reimported with the temporary FBX.

Exporting the FBX into a temporary directory makes sure no project files for the game are modified, which could raise problems with Perforce and other version control systems. It also means that if you only wanted to quickly test some changes reloading the game will revert back the model into its unaltered state.

# If I had more time
I think this kind of application could be interesting to glue together many different programs of a pipeline. Currently, my first implementation of this only allows a single server/editor to connect to mupltiple instances of a running game. However, if the server is a standalone process and both the game and editors acts as clients, multiple editors could connect to multiple game instances simultaneuosly. I think a very interesting capability would be to let the game request models to be opened in the most appropriate editor, perform a lookup for .mb or .blend files from a predefined set of directories inside an art depot and open the file in either Maya or Blender based on the file extension. It could also act as a unified debugging output for multiple game clients.