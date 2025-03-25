+++
title = 'Procedural Fence Generator'
summary = '''
'''
tags = []
date = 2025-03-10
draft = true
+++
I've created a spline-driven fence generator in Houdini with tweakable parameters, interchangable models and used content from [Quixel Megascans](https://www.fab.com/sellers/Quixel) to spice up this demo!

{{< fakegif "procedural-fence-demo.webm" >}}

I've wanted to dive deeper into Houdini Digital Assets for quite some time because as a programmer I've seen people make numerous tools for placing models according to specific rules or inputs. Often I've found these tools error prone, inflexible and tedious to expand upon, and optimizing them adds another level of complexity.

Houdini Digital Assets on the other hand provides both lower and higher levels of control, where each piece can be controlled individually but also the system as a whole. I wanted to learn Houdini as the non-destructive node workflow makes it far easier to iterate and experiment, but Houdini also makes it easier to expose more parameters in an artist-friendly manner. Developing a fence generator has definetly improved how I expose parameters to the end user!

## How it works
{{< fakegif "procedural-fence-generator-usage.webm" >}}

## Technical Breakdown
{{< fakegif "procedural-fence-generator-breakdown.webm" >}}

## If I hade more time
