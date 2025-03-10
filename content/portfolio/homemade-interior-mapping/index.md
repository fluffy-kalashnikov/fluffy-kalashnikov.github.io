+++
title = 'Homemade Interior Mapping'
summary = '''
'''
tags = []
date = 2025-02-10
draft = false
+++
I created the interior mapping shader and interior cubemaps used for this demo. Big thanks to [Agnes Hallin](https://agneshallin.artstation.com/projects) for letting me use her modular building kit and environment used in the background!

{{< fakegif "interior-mapping-demo.webm" >}}


I have a big fascination for parallax effects in games and wanted get a better understanding of how these techniques work. I found the [Interior Mapping paper by Joost van Dongen (2008)](https://www.proun-game.com/Oogst3D/CODING/InteriorMapping/InteriorMapping.pdf) during my research and wanted to give an attempt at implementing this myself. 

The technique uses raycasting to determine where in the cubemap to sample from. By raycasting against a corresponding plane for X, Y, Z and selecting the closest point of intersection, we can sample the cubemap in such a way to give the illusion of volume inside a flat plane!


{{< tableofcontents >}}


## Understanding intersections between rays and planes
```hlsl
float PlaneRayIntersection(float3 RayPoint, float3 RayDirection, float3 PlaneNormal, float PlaneDistance)
{
    float T = PlaneDistance - dot(RayPoint, PlaneNormal);
    T /= dot(RayDirection, PlaneNormal);
    return T;
}
```
To understand how the interior mapping works, it is important to understand what rays and planes are and how we can calculate the point of intersection between them from a purely mathematical standpoint. If you want a proper explanation of this code snippet I can wholeheartedly recommend [gamemath.com](https://gamemath.com/book/geomtests.html#intersection_ray_plane), but let me give an attempt at visualizing it!

TODO: video med raycasts

In my personal experience, I think the key takeaways are this: Rays are parametrically defined by a point and a direction. Planes are implicitly defined by a normal and a distance from the origin. Unlike 3D geometry, rays and planes in mathematics are infinite. Unless the ray is perfectly perpendicular to a plane, it will always intersect in either the positive or negative direction.



## How the interior mapping works

TODO: image of tiling flat planes
We begin by calculating the normals of the planes by looking at the camera direction. The planes will always face their corresponding X, Y, Z axis, but how do we know if it is in the positive direction or negative direction?



We begin by calcuating the planes to intersect against by rounding up or down the vertex position with the room size. We also need to take into consideration where the normals of the planes are facing. They will always face the camera along X, Y, Z, so by checking if a particular component of the camera direction is negative or not we know if the corresponding plane is facing in the positive or negative direction.

TODO: image of raycasting against 3 planes and selecting the closest intersection to the camera

Now that we have the normals and distances of each axis-aligned plane to intersect against, we can do our intersection tests for the X, Y and Z axis. This results in 3 scalars representing the distance of the intersection on each axis. By selecting the minimum value, we can calculate the closest point of intersection. With the camera position and camera direction, we can



Hooray! But how are we supposed to sample the cubemap with this? We actually need a direction to sample from. By subtracing our point of intersection with the center of the room we can get a direction that samples the cubemap perspectively correct!

## If I had more time

