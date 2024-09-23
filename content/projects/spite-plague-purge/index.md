+++
title = 'Spite - Plague Purge'
summary = '''
Spite - Plague Purge was my sixth game project at [The Game Assembly](https://thegameassembly.com) and heavily inspired by Diablo III. 
It was made in our custom game engine Clockwork. We basically scrapped the game engine from [Eggscapism](../eggscapism/) apart from
the graphics engine and merged it with another engine. The project is not finished yet.
'''
tags = ['C++', 'Clockwork Engine', 'Direct3D 11', 'Perforce', 'YouTrack']
date = 2024-01-07T18:57:41+01:00
draft = false
credits = [
    'Ameer Khalid',
    'Cecilia Ålander',
    'David Lindberg',
    'Ethan Uong',
    'Hedvig Kronnäs',
    'Ivar Sidorsson',
    'Jakob Pihl',
    'Jenny Hellström',
    'Joar Andersén',
    'Jonathan Disenfeldt',
    'Linnéa Sjöstrand',
    'Luna Barane',
    'Olaus Klaveness',
    'Sofie Axelsson',
    'Siri Forsell',
    'Urban Gustavsson',
    'Viktor Pennonen',
    'Vincen Nguyen',
    'Wasin Laokhot',
    'Youcef Lounes',
]
+++

Spite - Plague Purge was my sixth game project at [The Game Assembly](https://thegameassembly.com) and heavily inspired by Diablo III. 
It was made in our custom game engine Clockwork. We basically scrapped the game engine from [Eggscapism](../eggscapism/) apart from
the graphics engine and merged it with another engine. It was a decision made without any formal agreement between us programmers,
and I had no insight into this decision as I was busy finishing [Eggscapism](../eggscapism/). However, we recovered fairly fast and 
have since improved our cooperation a lot. I am grateful that we hit this low point as early into the project as we did, and I have 
learnt a lot from it. 

During the project my role as the primary graphics programmer was reinforced, and I was responsible for
* Premake5 integration
* Shadow mapping
* Shader preview tool with autoreload
* Serializible shader pipeline
* Translucent/opaque material support
* Splitting Editor/Game
* Playtesting
* Rendering optimizations
* Deferred rendering spotlight/pointlight support
* Debug rendering

My proudest achievement was finishing the serializible shader pipeline. It allowed our technical artists to create materials with
pipeline state objects loaded from JSON containing bindings for custom shaders, textures, samplers, depth stencils and other 
necessary Direct3D 11 resources. Combined with the shader preview it allowed them to iterate visual effects very quickly, and
altough I wouldn't call the solution elegant as of now, it certainly felt so back then.