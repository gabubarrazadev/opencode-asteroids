---
description: Crea un worktree local en .worktrees/ con el nombre indicado.
agent: build
---

Toma el argumento completo como nombre del worktree: $ARGUMENTS

Reemplaza cada grupo de espacios por un guion y quita los espacios al principio y al final. Si el nombre resultante está vacío, no ejecutes nada. Ejecuta únicamente `git worktree add .worktrees/<nombre-normalizado>`, pasando la ruta completa como un solo argumento correctamente entrecomillado para el shell. No ejecutes otros comandos ni modifiques archivos.
