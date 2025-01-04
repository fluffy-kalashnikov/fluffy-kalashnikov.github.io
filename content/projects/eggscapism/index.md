+++
title = 'Eggscapism'
date = 2024-01-07T18:57:34+01:00
draft = false
summary = '''
**20XX-XX-XX to 20XX-XX-XX**

Eggscapism is a narrative puzzler where you need restore the power and call for help to escape an arctic laboratory from an ominous presence. Inspired by Legend of Grimrock 2. Made in Clockwork Engine.

**Game Programmer Responsibilities**
  *  aaaaaaaaaaaaaaaaaaaaaaa
  *  bbbbbbbbbbbbbbbbbbbbbbb
  *  ccccccccccccccccccccccc
  *  ddddddddddddddddddddddd
'''
+++

Eggscapism is a narrative puzzler roughly 2 minutes in length. It was the fifth project 
at [The Game Assembly](https://thegameassembly.com) and it was the first project where 
we used our own game engine made from scratch. Given that I was the only programmer 
in my group willing to do graphics programming and that my graphics engine was the most 
complete at the time, we decided to use my graphics engine as the foundation.

I was responsible for
* Graphics programming
* Splash screens
* Main menu
* Pause menu
* Win menu
* HUD

Overall this project felt very chaotic. We had very many issues regarding our pipeline to iron out.
We never managed to find a correct way to convert a quaternion from Unreal Engine to 
euler angles. We still used meters as units compared to centimeters in Unreal Engine, which
made the models have very different scales and locations. The texture format we used for
normals and materials were incompatible and broke the normal/material mapping inside the engine.
Levels built in Unreal Engine did not look similar at all ingame because of the shading.

Isolating, fixing or hiding every issue was very difficult and time-consuming. I am suprised we were
the first to be approved.

![Screenshot of the main room with a huge egg.](egg.webp)