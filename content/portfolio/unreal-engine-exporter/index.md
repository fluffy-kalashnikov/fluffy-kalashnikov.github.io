+++
title = 'Unreal Engine Exporter'
summary = '''
'''
tags = []
date = 2024-10-01
draft = false
+++

```md
Under spelprojekt 7 märkte jag av problem med pipeline

Vad var problemet
* Exportera levlar enklare
* Speltestning för icke-tekniska
* DDS-exportering 


Vad fanns från början? 

Vilka features har jag lagt till?

TODO: Loopande korta videor för textur-export, speltest och perforce integration
```
During the game projects as a Technical Artist I've primarily been responsible for standardizing and improving the pipeline for our artists and level designers. As the programmers began development of Tre Rader Kod, our custom game engine, we were handed an Unreal Engine plugin by the educators to export level data we could feed into Tre Rader Kod. It was cumbersome to use at the start, but over all iterations I've made since then I'm happy I've found numerous ways to improve it!

### Playtesting
To playtest a level in development, we were required to
* Click the export button
* Choose an export directory through a file picker dialogue
* Click OK in an annoying success prompt
* Export all missing models
* Locate the game from File Explorer
* Launch the game
* Open the level from a debug level selection menu

To alleviate this, I created a button to launch the game from within Unreal Engine. I also got rid of the file picker and turned the success prompt into a notification instead. A lot of people forgot to export levels before launching the game, so to make sure the level data always is up to date I made sure the play button always exports the level before launching the game. I also made sure the play button sends which level to load directly to the game by providing command line arguments containing the newly exported level path.

At this point you can playtest a level open in Unreal Engine seamlessly with the press of a button, but later during development I also added a button to play directly from where the viewport camera is located in Unreal Engine. I also added a button to launch RenderDoc with the same information, so you launch anywhere in a level ready to take captures.

### Exporting Models
While we originally used FBX files directly, our programmers decided to convert them into a binary format to improve load speeds. This proved problematic because everyone had to export themselves as the binary files wasn't synced with version control, so missing models was more of a norm than a deviation. TODO: continue

### Exporting Textures
Tre Rader Kod uses Direct3D 11 and doesn't use any external libaries to load textures, thus we are required to convert all textures into the native DirectDraw Surface format. Our initial approach to this was manual, but our graphical artists found it cumbersome to export each time they wanted to see how a texture looks ingame. It was very error-prone as they had to choose the correct compression format and wether the texture should be converted to sRGB or not.

To address this I initially wrote a batch script to convert textures in bulk using the DirectXTex conversion application. I rewrote it in Python to add additional layers of validation, but to streamline it further I began integrating it in C++ with the Unreal Engine level exporter directly. Hooking into Unreal Engine directly ment that I could provide a unified interface for exporting assets, validating assets, playtesting levels, and errors could be communicated directly with the end user through notifications. Relying on file naming conventions alone to determine if an Unreal Engine asset was a texture or not proved problematic as artists frequently forgot about prefixes/suffixes, so querying Unreal Engine's asset manager directly proved much more reliable.

### Perforce Integration
TODO: write