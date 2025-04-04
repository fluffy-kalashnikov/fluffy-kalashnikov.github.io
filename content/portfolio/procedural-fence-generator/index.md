+++
title = 'Procedural Fence Generator'
summary = '''
'''
tags = []
date = 2025-03-10
draft = false
+++
I've created a spline-driven fence generator in Houdini with tweakable parameters that let other disciplines create fences from already existing models! All the models used below are from [Quixel Megascans](https://www.fab.com/sellers/Quixel).

{{< fakegif "procedural_fence_generator_01_showcase.webm" >}}

For a long time I was intimidated about learning Houdini for game development, but I was very inspired by a lecture from David Lindberg to start small in Houdini and develop increasingly sophisticated things over time. During [P7]() I decided to integrate Houdini into our custom engines pipeline, and with all the accumulated experience from producing smaller Houdini Digital Assets during development I've become a lot more confident with Houdini.

With this fence generator I wanted to dive deeper into producing Houdini Digital Assets natively for Unreal Engine with many parameters that other disciplines can bend to their will. During testing I discovered many happy accidents that were polished into features in the end!


## Placing the fence
{{< fakegif "procedural-fence-generator-usage.webm" >}}

When artists drags out the Houdini Digital Asset into the level, they are immediately presented with a spline that they can adjust and add control points to. Adjusting control points or parameters automatically causes Houdini Engine to recook the asset.

![](houdini_fence_parameters.png)

This particular fence uses instancing to place out each board/rail/post individually, and this has the benefit of allowing artists to build fences out of existing static meshes.


## Generating the fence
{{< fakegif "procedural-fence-generator-breakdown.webm" >}}

The process of generating the fence basically comes down to
1. Place post points along the input curve.
2. Place board points and orient them by interpolating between adjacent posts.
3. Merge board points at special segments into gates instead.
3. Place rail points based on the median position of the boards, taking their up direction into consideration.
4. Instantiate static meshes at each point by setting the `s@unreal_instance` attribute, or optionally debug geometry


## If I hade more time
