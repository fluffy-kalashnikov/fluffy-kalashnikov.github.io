+++
title = 'Mochi The Longest Tuesday'
date = 2024-01-01
draft = false
roles = ['Game Programmer']
summary = '''
Mochi The Longest Tuesday is a third person platformer where you as Mochi, a cat with a mech, has to search an alien planet for your beloved cardboard-box. Inspired by Jak & Daxter. Made in Clockwork Engine.
'''
+++
# Mochi The Longest Tuesday
Mochi - The Longest Tuesday is my seventh game project at [The Game Assembly](https://thegameassembly.com) and is 
heavily inspired by [Jak & Daxter](https://en.wikipedia.org/wiki/Jak_and_Daxter). As [Spite - Plague Purge](../spite-plague-purge/)
missed the deadline and some rendering features like post processing was necessary for both projects, there was a fair
bit of overlap between the projects in terms of the graphics engine.

I was responsible for
* Skybox
* Detail normals
* Level of Detail
* Shadow mapping improvements
* Video player (unused :c)
* Simplifying shader pipeline
* Post process pipeline
* Frustrum culling
* Multiple directional light support
* Multiple material support

I am particularly fond of the post process pipeline due to its simplicity. I managed to duct-tape the pipeline state object serialization
with a declarative plain-text document where each line represents a drawcall with corresponding input/output texture parameters. It is
quite flexible, and I managed to extract all previously hard-coded post process effects like bloom and luminescence. It truly granted
technical artists the ability to go nuts.