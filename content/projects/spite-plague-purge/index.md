+++
title = 'Spite Plague Purge'
date = 2023-10-02
draft = false
summary = '''
**2023-10-02 to 2023-12-08**

Spite Plague Purge is an ARPG where you fight the infected with your crossbow and crow companion through gothic-themed levels. Inspired by Diablo 3. Made in Clockwork Engine.

**Game Programming Responsibilities**
  *  Deferred rendering pointlight/spotlights
  *  Custom shader pipeline
  *  Live shader preview
  *  Shadow mapping
'''
+++
# Spite Plague Purge
Spite - Plague Purge was my sixth game project at [The Game Assembly](https://thegameassembly.com) and heavily inspired by Diablo III. 
It was made in our custom game engine Clockwork. We basically scrapped the game engine from [Eggscapism](../eggscapism/) apart from
the graphics engine and merged it with another engine. It was a decision made without any formal agreement between us programmers,
and I had no insight into this decision as I was busy finishing [Eggscapism](../eggscapism/). However, we recovered fairly fast and 
have since improved our cooperation a lot. I am grateful that we hit this low point as early into the project as we did, and I have 
learnt a lot from it. 

During the project my role as the primary graphics programmer was reinforced, and I was responsible for
* Custom shader pipeline
* Debug rendering
* Deferred rendering spotlight/pointlight support
* Live shader preview
* Translucent/opaque material support
* Splitting Editor/Game
* Playtesting
* Rendering optimizations
* Shadow mapping

My proudest achievement was finishing the plain-text shader pipeline. It allowed our technical artists to create materials with
pipeline state objects loaded from JSON containing bindings for custom shaders, textures, samplers, depth stencils and other 
necessary Direct3D 11 resources. Combined with the shader preview it allowed them to iterate visual effects very quickly, and
altough I wouldn't call the solution elegant as of now, it certainly felt so back then.