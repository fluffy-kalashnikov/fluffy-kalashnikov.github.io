+++
title = 'Mochi The Longest Tuesday'
date = 2024-01-07T18:57:43+01:00
draft = false
summary = '''
**20XX-XX-XX to 20XX-XX-XX**

Mochi The Longest Tuesday is a third person platformer where you as Mochi, a cat with a mech, has to search an alien planet for you beloved cardboard-box and deal with the slimy inhabitants. Inspired by Jak & Daxter. Made in Clockwork Engine.

**Game Programmer Responsibilities**
  *  aaaaaaaaaaaaaaaaaaaaaaa
  *  bbbbbbbbbbbbbbbbbbbbbbb
  *  ccccccccccccccccccccccc
  *  ddddddddddddddddddddddd
'''
+++

Mochi - The Longest Tuesday is my seventh game project at [The Game Assembly](https://thegameassembly.com) and is 
heavily inspired by [Jak & Daxter](https://en.wikipedia.org/wiki/Jak_and_Daxter). As [Spite - Plague Purge](../spite-plague-purge/)
missed the deadline and some rendering features like post processing was necessary for both projects, there was a fair
bit of overlap between the projects in terms of the graphics engine.

I was responsible for
* Skybox
* Shadow mapping improvements/fixes
* Transparency fixes
* Video player
* Detail normals
* Level of Detail
* Exposing parameters by Technical Artist requests
* Post process pipeline
* Rendering optimizations
* Multiple directional light support
* Debug rendering

I am particularly fond of the post process pipeline due to its simplicity. I managed to duct-tape the pipeline state object serialization
with a declarative plain-text document where each line represents a drawcall with corresponding input/output texture parameters. It is
quite flexible, and I managed to extract all previously hard-coded post process effects like bloom and luminescence. It truly granted
technical artists the ability to go absolutely nuts.