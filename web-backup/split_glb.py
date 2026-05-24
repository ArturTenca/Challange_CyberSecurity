import trimesh
import os

print("Loading GLB...")
scene = trimesh.load('public/ford_ranger.glb', force='scene')

new_scene = trimesh.Scene()

for name, geom in scene.geometry.items():
    print(f"Splitting {name}...")
    # Split the mesh into connected components
    split_meshes = geom.split(only_watertight=False)
    print(f"  -> Split into {len(split_meshes)} parts")
    
    for i, m in enumerate(split_meshes):
        new_name = f"{name}_{i}"
        m.visual.material.name = new_name
        new_scene.add_geometry(m, node_name=new_name, geom_name=new_name)

print("Exporting split GLB...")
new_scene.export('public/ford_ranger_split.glb')
print("Done!")
