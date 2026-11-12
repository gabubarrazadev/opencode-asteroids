# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. En cada nivel aparece una estrella fugaz más rápida que los asteroides normales. Esquiva los disparos del OVNI y recoge los power-ups Velocidad, Escudo y Triple Shot.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |

## Puntuación

| Asteroide      | Puntos |
| -------------- | ------ |
| Grande         | 20     |
| Mediano        | 50     |
| Pequeño        | 100    |
| Estrella fugaz | 50     |
| OVNI           | 150    |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Una **estrella fugaz** por nivel: asteroide mediano dorado con estela que se mueve al triple de velocidad, desaparece tras 6 segundos y no se divide al destruirlo.
- Partículas de explosión al destruir asteroides
- Power-up **Velocidad**: aparece periódicamente como un círculo celeste con flechas. Al tocarlo, la nave se desplaza al doble de velocidad durante 5 segundos; el tiempo restante aparece en pantalla.
- Un **OVNI** aparece periódicamente, cruza la pantalla y dispara hacia la nave. Puedes destruirlo con un disparo para sumar puntos.
- Power-up **Escudo**: aparece periódicamente como un círculo violeta. Al recogerlo, un anillo protege a la nave de los proyectiles del OVNI durante 5 segundos; el tiempo restante aparece en pantalla. No protege de los asteroides.
- Power-up **Triple Shot**: comparte el ciclo de aparición con Velocidad y se distingue por su círculo dorado con tres puntos. Al recogerlo, cada pulsación de Espacio dispara tres balas sucesivas en línea recta durante 5 segundos. La dirección de cada ráfaga queda fijada al pulsar; el tiempo restante aparece en pantalla.
