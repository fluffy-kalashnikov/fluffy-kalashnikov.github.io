+++
title = 'Unreal Engine Exporter'
summary = '''
'''
tags = []
date = 2024-10-01
draft = false
+++

# Unreal Engine Exporter
Note: Videos have been sped up and cut to reduce length.

{{< fakegif "unreal_engine_exporter_showcase.webm" >}}

During the game projects with Vrak Studios I've had the primary responsibility to standardize and streamline the pipeline for our artists and level designers. 
The pipeline during [Spite Parasite](/projects/spite-parasite) was initially very manual, but with all iterations made since then I'm happy over the numerous ways I've found to improve it!

### Playtesting the game
To playtest a level in development, we were initially required to
* Click the export level button
* Choose an export directory through a file picker dialogue
* Click OK in a blocking success prompt
* Locate the game from File Explorer
* Launch the game
* Open the level from a debug level selection menu

{{< fakegif "unreal_engine_exporter_playfromstart.webm" >}}

To alleviate this, I created a launch button inside of Unreal Engine. The current level is automatically exported and loaded at startup, and error notifications was turned into non-blocking success/failure toasts.

{{< fakegif "unreal_engine_exporter_renderdoc.webm" >}}

This already improved the situation a lot, but playtesting longer levels is cumbersome if you always need to play through the entire level to reach a specific spot. I collaborated with [Truls](https://trulsrockstrom.com/) and [Alvin](https://www.alvineriksson.com/) to implement a separate "play from here" button and also integrated RenderDoc with similar logic.


### Exporting assets
The custom engine requires meshes to be in a custom binary format and textures to be converted into DirectDraw Surface. Early during [Spite Parasite](/projects/spite-parasite) these game-ready assets weren't synced with version control, and it was very common for the game to crash because of outdated assets. 

Meshes were converted into binary format when the game launched, significantly impacting startup time for playtesting. Textures were exported from a script that converted based on file naming standards, but issues arising from incorrect spelling was common. Exports could have incorrect color space, incorrect compression type or simply not happen at all.

{{< fakegif "unreal_engine_exporter_exportchangelist.webm" >}}

To improve, all tools were integrated into Unreal Engine and the pipeline was reorganized around a separate content folder exclusively for game-ready assets synced with version control. The texture and mesh converters now exports directly into the game-ready content folder, and Perforce has been integrated to give the option of only exporting assets that could have changed. Output files are automatically checked out or marked for add, and this means artists literally only have to drag an asset into the content browser, press export changelist and submit.

Integrating into Unreal Engine allowed direct access to the asset manager and asset properties, and has allowed for far greater depths of validation.