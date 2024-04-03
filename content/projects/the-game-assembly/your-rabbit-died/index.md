+++
title = 'Your Rabbit Died'
summary = '''
_Your Rabbit Died_ is a puzzle game built for mobile. It was the second game project 
at [The Game Assembly](https://thegameassembly.com) and was made in Unity as well.
'''
tags = ['C#', 'Unity', 'Perforce', 'Taiga']
date = 2024-01-07T18:57:27+01:00
draft = false
screenshot = '/projects/the-game-assembly/your-rabbit-died/overworld.webp'
credits = [
    'Alfred Nilsson',
    'Anton Johansson',
    'Cecilia Ålander',
    'David Hamark',
    'Elden Bähni',
    'Elias Böök',
    'Gustaf Löfkvist Andersson',
    'Ivar Sidorsson',
    'Jeff Persson',
    'Johan Fryklander',
    'Linus Svensson',
    'Olaus Klaveness',
    'Sofie Axelsson',
]
+++

{{<youtube id="AMju0Vkug08" title="Your Rabbit Died trailer.">}}

_Your Rabbit Died_ is a puzzle game built for mobile. It was the second game project 
at [The Game Assembly](https://thegameassembly.com) and was made in Unity as well.

I was responsible for
* Building/shipping
* Dialogue
* Grid system/tooling
* Sound system/playback
* Mobile support

I am particularly proud of the grid system/tooling and automatically generating 
connections based on the grid layout. I purposely attempted to achieve an agile 
workflow and managed to create a working prototype within 3 days. During production 
the system saw many improvements to functionality and workflow based on 
level designer feedback. Some features included
* Swapping editor build button to build keybind
* Height support
* Duplicate tile validation
* Connection/path visualization
* Orientation visualization

![Screenshot of overworld in Your Rabbit Died.](overworld.webp)
![Screenshot of underworld in Your Rabbit Died.](underworld.webp)