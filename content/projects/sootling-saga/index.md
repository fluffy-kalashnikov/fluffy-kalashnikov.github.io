+++
title = 'Sootling Saga'
summary = '''
Sootling Saga is a sidescrolling platformer. It was the first game project
at [The Game Assembly](https://thegameassembly.com) and was made in Unity.
I was one of the few in my group with prior experience of Unity, so I assisted
my other programmers as much as I could.

Game Programmer Responsibilities
  *  Building/shipping
  *  Checkpoints
  *  Editor playtest tooling
  *  UI
  *  Scene transitions
  *  Score/pickups
  *  Cutscene playback
'''
tags = ['C-sharp', 'Unity', 'Perforce', 'Taiga']
date = 2024-01-07T18:57:04+01:00
draft = false
screenshot = '/projects/sootling-saga/cave.webp'
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