+++
title = 'Procedural Fence Generator'
summary = '''
'''
tags = []
date = 2025-03-10
draft = true
+++
I've created a spline-driven fence generator in Houdini with tweakable parameters that let other disciplines create fences from already existing models! All the models used below are from [Quixel Megascans](https://www.fab.com/sellers/Quixel).

{{< fakegif "procedural_fence_generator_01_showcase.webm" >}}

For a long time I was intimidated about learning Houdini for game development, but I was very inspired by a lecture from David Lindberg to start small in Houdini and develop increasingly sophisticated things over time. During [P7]() I decided to integrate Houdini into our custom engines pipeline, and with all the accumulated experience from producing smaller Houdini Digital Assets during development I have become a lot more confident in Houdini!

With this fence generator I wanted to dive deeper into producing Houdini Digital Assets natively for Unreal Engine and also create a more generic Houdini Digital Asset with many parameters that other disciplines can bend to their will. During testing I discovered many happy mistakes that I polished into features in the end!


## How it works
{{< fakegif "procedural-fence-generator-usage.webm" >}}

## Technical Breakdown
{{< fakegif "procedural-fence-generator-breakdown.webm" >}}

## If I hade more time
