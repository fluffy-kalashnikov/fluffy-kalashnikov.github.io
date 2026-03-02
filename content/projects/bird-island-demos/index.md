+++
title = 'Birdisland Demos'
date = 2026-01-23
draft = false
roles = ['All', 'Game Programmer', 'Technical Artist']
summary = '''
Work I did for 3 currently unreleased demos at Birdisland! They are RPGs which all share a core of turn-based combat with a focus on narrative and branching paths. Developed in Unity.
'''
+++
# Birdisland Demos
During my internship at Birdisland, I had a focus on creating combat VFX, and procedural tools in Houdini. I also created the combat VFX backend as their earlier games haven't had a focus on combat VFX, so there wasn't an existing pipeline for this. 

The games share a turn-based-tactics module which handles all combat logic in terms of pure data, and acts as the source of thruth of all consequences actions have on the battlefield. The VFX systems hooks into events and spawns VFX accordingly. The items/weapons the characters hold are actually handled this way as well!

## Combat VFX backend
The backend relies heavily on the Visual Effects Graph (VFX graph) and Shader Graph packages in Unity. It had some challenges and iterations as it had to be modular enough to suit 3 different projects, which in turn had a lot of models from older projects and asset packs with different material/uv setups to adapt. I think in the end it turned out pretty decent!

### Input Events
When the player makes their turn, a VFX graph is spawned. When the player lunges towards the enemy, there are multiple animation events from the character which is translated to input events inside the VFX graph. This gives the VFX graph opportunity to spawn different effects at different time intervals, and as of this moment there are 4 events:

![alt text](backend-input-events.webp)

* **Init** - Called directly after instantiation, useful for debug purposes
* **Windup** - Called when charging the animation, for example when throwing a grenade
* **Main** - Called at climax of the animation, for example when the thrown grenade explodes
* **Hit** - Called when damage is registered

### Output Events
There is also some special output events which lets the VFX graph trigger logic outside of the graph. This is currently used for triggering camera shake, and debugging purposes like pausing the editor. Especially debug pausing the editor has been very useful for determining whether an event is invisible or simply isn't triggered in the first place, and for inspecting the character animator to see if an event gets culled by mistake.

![alt text](backend-output-events.webp)

### Properties
A lot of ability effects like the sword swing and musket shot require properties to know which direction to face, which character is targeted and such. These documented properties are updated continuosly while the effect is alive.

![alt text](backend-properties.webp)

Most properties are positions, directions, and orientations. These are fetched from each characters socket setup, which determines for example which position and orientation the weapon has. Most attacks have a direction towards the enemy, and ranged attacks are usually targeted from the characters weapon towards the opponents center of gravity.

{{< fakegif "backend-sockets.webm" >}}

There's also a property for each characters `SkinnedMeshRenderer`, which is used for sampling positions on the mesh for certain effects like the fire status effect. 

### Extra Render Passes
Especially to show characters in different states, I think applying materials on top of the character is important to make them look affected by the VFX. Extra render passes is primarily used for status effects, but would be nice to have for hit indicators and other stuff as well.

{{< fakegif "backend-extra-render-passes.webm" >}}

To implement this I initially used the special rule for the `MeshRenderer` component, that if more materials are added than the mesh itself has slots for, the last submesh is rendered with an additional render pass for each extra material. 

However, some projects had characters that were modular and thus split into many different submeshes, and sometimes even gameobjects.

{{< fakegif "backend-skinned-mesh-sampling.webm" >}}

To solve this I decided to replace this logic with a custom render pass so that multiple submeshes on a single mesh can be rendered. Unfortunately I didn't find a way to batch drawcalls for skinned meshes, this would probably be a nice place to do so.
```cs
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.Rendering.RenderGraphModule;
using PortaPlay.TurnBasedTactics.CombatEffectSystem;


class CombatEffectOverlayPass : ScriptableRenderPass
{
    Material[] _overlayMaterials;
    List<SkinnedMeshRenderer>[] _overlayRenderers;


    public void Init(Material[] overlayMaterials, List<SkinnedMeshRenderer>[] overlayRenderers)
    {
        renderPassEvent = RenderPassEvent.AfterRenderingOpaques;
        _overlayMaterials = overlayMaterials;
        _overlayRenderers = overlayRenderers;
    }


    private record PassData
    {
        public Material[] materials;
        public List<SkinnedMeshRenderer>[] renderers;
    }


    public override void RecordRenderGraph(RenderGraph renderGraph, ContextContainer frameData)
    {
        using (var builder = renderGraph.AddRasterRenderPass<PassData>("Combat Effect Overlay", out var passData))
        {
            passData.renderers = _overlayRenderers;
            passData.materials = _overlayMaterials;

            UniversalResourceData resourceData = frameData.Get<UniversalResourceData>();
            builder.SetRenderAttachment(resourceData.activeColorTexture, 0);
            builder.SetRenderFunc((PassData data, RasterGraphContext context) => ExecutePass(data, context));
        }
    }


    private static void ExecutePass(PassData data, RasterGraphContext context)
    {
        for (int o = 0; o < (int)MaterialOverlay.MAX; ++o)
        {
            if (data.materials[o] == null)
            {
                continue;
            }

            for (int n = 0; n < data.renderers[o].Count; ++n)
            {
                for (int submesh = 0; submesh < data.renderers[o][n].sharedMesh.subMeshCount; ++submesh)
                {
                    context.cmd.DrawRenderer(data.renderers[o][n], data.materials[o], submesh, 0);
                }
            }
        }
    }


    /** Required for Project Settings->Graphics->Compatility Mode in Njords Embrace **/
    public override void Execute(ScriptableRenderContext context, ref RenderingData renderingData)
    {
        CommandBuffer cmd = CommandBufferPool.Get();
        for (int o = 0; o < (int)MaterialOverlay.MAX; ++o)
        {
            if (_overlayMaterials[o] == null)
            {
                continue;
            }

            for (int n = 0; n < _overlayRenderers[o].Count; ++n)
            {
                for (int submesh = 0; submesh < _overlayRenderers[o][n].sharedMesh.subMeshCount; ++submesh)
                {
                    cmd.DrawRenderer(_overlayRenderers[o][n], _overlayMaterials[o], submesh, 0);
                }
            }
        }
        context.ExecuteCommandBuffer(cmd);
        CommandBufferPool.Release(cmd);
    }
}
```


## Combat VFX 
Unfortunately the VFX didn't make it much further than the blockout stage, I think much of it comes down to the fact that the VFX backend at a lot of time and that iteration time was slow as there wasn't a test environment to try abilities/status effects efficiently.

Some other stuff that complicated things was that the character animations were adapted from Mixamo and older projects, and thus we didn't have blockouts resembling the final product (we didn't have an animator). The items themselves didn't exist as I modeled and implemented them after the VFX was done due to priorities. This led to the VFX overcompensating for a lack of animation/weapons, and thus it might have been more pronanced at times than it should have been.

In terms of planning for VFX not much had been done before I joined, but I tried to do the best of the situation and organized excel sheets of items, abilities, status effects and other stuff that had to be made. This was done in the other projects as well.

![alt text](vfx-sheet.webp)

### Ability effects
The melee swing uses scrolling UVs for the main projectile and some bloom

{{< fakegif "ability-melee-swing.webm" >}}

![alt text](ability-melee-swing-shadergraph.webp)

Projectiles reuse a subgraph that primarily creates an arch and adds some angular rotation to a model, and an extra explosion effect

{{< fakegif "ability-throw-projectile.webm" >}}

![alt text](ability-throw-projectile-vfxgraph.webp)

Smoke clouds was reused a lot for magic effects, they use 2 scrolling layers of smoke and a dissolve

{{< fakegif "ability-smoke.webm" >}}

![alt text](ability-smoke-shadergraph.webp)

Larger smoke clouds variation for AoE effects

{{< fakegif "ability-smoke-large.webm" >}}

Trailing smoke for push

{{< fakegif "ability-smoke-trail.webm" >}}

Musket shot uses a plane scaled to match the distance with scrolling noise

{{< fakegif "ability-musket-shot.webm" >}}

![alt text](ability-musket-shot-vfxgraph.webp)

![alt text](ability-musket-shot-shadergraph.webp)

Grappling hook is basically the same thing but with 2 planes

{{< fakegif "ability-grappling-hook.webm" >}}

![alt text](ability-grappling-hook-vfxgraph.webp)

### Hurt effects
The melee damage blood splash is a slightly fancier dissolve where the particle becomes larger over time

{{< fakegif "hurt-melee-blood-splash.webm" >}}

![alt text](hurt-melee-blood-splash-shadergraph.webp)

![alt text](hurt-melee-blood-splash-vfxgraph.webp)

The darkness damage effect reuses the blood splash graph with a different texture

{{< fakegif "hurt-darkness.webm" >}}

Fire damage causes a bunch of extra spark particles to appear which randomly changes direction and fades out

{{< fakegif "hurt-fire.webm" >}}

![alt text](hurt-fire-vfxgraph.webp)

![alt text](hurt-fire-vfxgraph2.webp)

### Status effects
Aflame uses scrolling triplanar texture sampling for the character itself, and uses mesh sampling to spawn additional fire particles around the characters limbs. The triplanar texture sampling uses local positions except for the Y-axis to make it feel attached to the character

{{< fakegif "status-aflame.webm" >}}

![alt text](status-aflame-vfxgraph.webp)

![alt text](status-aflame-shadergraph.webp)

Lacerated adds a tiling blood texture for the character itself, and uses mesh sampling to spawn additional blood drops around the character. The blood drops die on contact with the ground, and spawns a small blood splash in its place.

{{< fakegif "status-lacerated.webm" >}}

![alt text](status-lacerated-vfxgraph.webp)

Darkened uses double layers of scrolling triplanar texture sampling, and a fresnel to keep the character recognizible

{{< fakegif "status-lacerated.webm" >}}

![alt text](status-darkened-shadergraph.webp)

Lit uses a basic fresnel to highlight enemies

{{< fakegif "status-lit.webm" >}}

![alt text](status-lit-shadergraph.webp)

## Houdini

### Trash Mountain
The trash mountain HDA generates an underlying mountain and adds trash props on top. It also generates a simplified collision mesh. The trash props are weighted and can be adjusted with seeds.
![alt text](houdini-trash-mountain.webp)

![alt text](houdini-trash-mountain-shape.webp)

![alt text](houdini-trash-mountain-collision.webp)

Initially the mountain as generated by painting a black/white heightmap which I think was simpler, but on request the mountain was changed to generate itself by placing cubes and generate a heightmap from it.

![alt text](houdini-trash-mountain-cubes.webp)

These cubes are of course interpreted quite loosly as it's difficult to make a nice mountain out of a few cubes quickly. I think the heightfield_distort node is the most important node to make the mountains feel nice and organic.

![alt text](houdini-trash-mountain-heightfield-distort.webp)

For instantiating the props I first built a look-up-table of variant-specific data. I used multiparm blocks for the properties and experimented with using a FBX path parameter and importing using the File SOP instead of using the designated input nodes. 

I initially split the variants by connection, but this was problematic as some of the existing models weren't watertight and hade disconnected pieces inside of them. This could probably be resolved by splitting using the unity_mesh attribute, but each mesh needs weight and collision data associated with them.

![alt text](houdini-trash-mountain-multiparm-blocks.webp)

The benefits I saw with using a FBX parameter is that it is intuitive as each multiparm block always should have a model associated with it. If you use geometry input instead these multiparm blocks have to be kept in sync and still need some sort of key to identify which mesh the data belongs to. 

In the end I think using multiparm blocks with a key (probably heuassetpath parameter) would have been better to allow Houdini to cache the FBX input, it would also allow prefabs to be used which doesn't work with the File SOP.

![alt text](houdini-trash-mountain-prop-variants.webp)

To randomize the props a prop_variant attribute is set for each point on a point cloud, where the odds of setting a specific variant is distributed by weight. It builds an array which is randomly indexed where in this case 10 elements of the array refers to variant 0 and only 1 element refer to variant 1.

![alt text](houdini-trash-mountain-prop-weight-distribution.webp)

To make it easier to process and debug the meshes in Houdini, the meshes are instantiated as packed primitives despite the fact that only pointclouds are output in the end. This allows the instances to push intersecting geometry out of eachother using physics, and is also used to compensate for whacky model pivots.

![alt text](houdini-trash-mountain-prop-instantiation.webp)

Converting the packed prims back to a point cloud is done by reading the packedfulltransform and applying the pivot transform. (NOTE: not tested properly, might be incorrect)

![alt text](houdini-trash-mountain-pointcloud.webp)


### Character UV generator for VFX
The character UV generator was created since some asset packs had models which were UV-mapped for gradient atlas texturing. The HDA simply unwraps the UV set and stores it unnormalized in the second UV-set, so that VFX requiring tiling textures like the blood texture can work across all characters.

To make exporting quick, it's intended to use the batch export button which uses Python to scan the chosen FBX directory and run the export process for each FBX found.

{{< fakegif "houdini-character-uv-generator.webm" >}}

### Jetty
The jetty HDA was intended to be used for settlements, but alas it only reached the blockout stage. The level designer builds the intended walkable area and the HDA then generates planks and poles to fit.
![alt text](houdini-jetty.webp)
It also attaches to chosen nearby sufaces for more vertical platforms.
![alt text](houdini-jetty-large-cubes.webp)
![alt text](houdini-jetty-large.webp)














<!-- It was suprisingly complex in the beginning, I was originally tasked to make it support non-square ngons built with ProBuilder. I really wanted someone to try it as early as possible, but despite my best efforts I couldn't get a designer to try it or give sketches of what it was supposed to allow the designer to build until basically my last 2 weeks. 

When we finally sat down to sketch the settlements I realized we probably could ditch ProBuilder and just stick to cubes, if the HDA was remade it could probably be chopped in half with all ngon stuff out of the way. If I had more time I'd like to replace the planks and poles with proper textured models. The poles look a bit repetetive and could use some randomization to break up the patterns. -->