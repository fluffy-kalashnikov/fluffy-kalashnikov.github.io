+++
title = 'Procedural Fence Builder'
summary = '''
'''
tags = []
date = 2025-03-10
draft = true
+++
I created the Houdini Digital Asset and used content from Quixel Megascans to spice up this demo. This gorgeous [Fence Generator](https://www.artstation.com/artwork/lRg1Pe) by Linus Tegelbratt served as my main source of inspiration!

{{< fakegif "procedural-fence-demo.webm" >}}

I've wanted to dive deeper into Houdini for quite some time, mainly because of the way Houdini Digital Assets permits non-technical people to tweak parameters and inputs for you. It allows for a much more iterative workflow, but Houdini Digital Assets can also make environments feel more organic and varied by introducing slight randomness into structures in ways modular building kits cannot. Modular building kit fences where boards, posts, and rails are bundled together usually have to generic, straight with limited variation. 

In contrast, Houdini Digital Assets provide a lot more flexibility since they can instance each board/post/rail individually. It allows for smooth bezier curves as input, and since each fence piece is controlled individually slight randomness can be introduced to break up the siluette and add variation. Does this have a performance penalty? It really depends on what you compare it against. Instanced rendering makes it negligable, and it could even be argued that memory performance is improved as individual pieces occupies less memory than multiple modular kit variations.

Let's discuss how it works!

## How it works