# Using it in SceneEditor

[SceneEditor](https://github.com/VJigouline/SceneEditor) opens `.drc` files with mc-draco-import. Drop or open a `.drc` file. SceneEditor decodes it with three.js's Draco decoder, which it serves from `assets/draco3d`, made with `createDracoDecoder`.

The model is added to the scene, named after its file, and the view is refitted. A file that can't be read gives a **Failure** message, and the scene is unaffected. Warnings go to the browser console.

It comes in metres with Y up, like the other formats.
