+++
title = 'Sootling Saga'
summary = '''
**20XX-XX-XX to 20XX-XX-XX**

Sootling Saga is a sidescrolling platformer where you need to run, jump and dash your way through obstacles to lit the bonfire at the top of the mountain. Inspired by Canabalt. Made in Unity.

**Game Programmer Responsibilities**
  *  Checkpoints
  *  Editor playtest tooling
  *  UI
  *  Score/pickups
'''
tags = ['C-sharp', 'Unity', 'Perforce', 'Taiga']
date = 2024-01-07T18:57:04+01:00
draft = false
credits = [
    'Elden Bähni',
    'Elisabet Sarsenov',
    'Elvira Aldén',
    'Hedvig Kronnäs',
    'Ivar Sidorsson',
    'Jakob Persson',
    'Jeff Persson',
    'Jesse Emmoth',
    'Joakim Nilsen',
    'Johan Melkersson',
    'Johan Rubertsson',
    'Jonas Gustafsson',
    'Lovisa Wirtén',
    'Nanna Lundin',
]
+++

Sootling Saga is a sidescrolling platformer. It was the first game project
at [The Game Assembly](https://thegameassembly.com) and was made in Unity.
I was one of the few in my group with prior experience of Unity, so I assisted
my other programmers as much as I could.

I was responsible for
* Building/shipping
* Checkpoints
* Editor playtest tooling
* HUD
* Main menu
* Pause menu
* Settings menu
* Scene transitions
* Scores/pickups
* Cutscene playback

I am particularly fond of the editor playtest tooling as I struggled to find a way
to create temporary checkpoints that does not get saved in the scene yet still
exists when the editor enters Playmode and triggers a C# assembly reload. I overcame
this limitation by exploiting the editor preference system to create a checkpoint at
startup if a editor preference bool was set.

I also learned how to add custom editor commands to the editor context menu. I managed
to add a button to start playtesting from the location of any Transform-component inside
the game. Achieving something like this is something I have wanted for a long time in Unity.

{{<youtube id="whfLbvExxHE" title="Sootling Saga trailer.">}}