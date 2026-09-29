# Ember · Build 2 Release Notes

<sub>Build file: `260904r1.zip`</sub>

An early prototype of Ember. Each run generates a random dungeon from a set of room types. You can move, roll and shoot. Every level should be fully explorable, as long as you complete each room's condition.

## Controls

Keyboard and mouse.

| Control | Action |
| --- | --- |
| WASD | Move (8 directions) |
| Spacebar | Roll in the direction you're moving |
| Mouse position | Aim |
| Left click | Shoot. Hold to keep firing. |
| Tilde (`~`) | Open or close the dev console |

## How it works

**Movement.** Ember walks in eight directions with a walk animation for each. Rolling plays a roll animation in the direction you're moving. Room walls should stop Ember leaving the playable area.

**Weapon.** The gun points at your mouse. Each shot fires a projectile in that direction, and holding the button fires at a set rate. Projectiles disappear when they hit something. Shooting uses **Hatred**, the game's ammo.

**Rooms.** When Ember enters a room, its doors lock and the camera moves to the centre of the room. A room is cleared by **either** hitting all of its buttons **or** killing all of its enemies. Then the doors unlock and the camera goes back to following Ember.

## Expected flow

1. The dungeon generates.
2. Ember spawns.
3. Ember leaves the spawn room.
4. Ember goes through a corridor.
5. Ember enters a new room. The doors lock and the camera moves to the centre.
6. Ember completes the room's condition. The doors unlock and the camera follows Ember again.
7. Repeat steps 4 to 6 until every room has been found.
8. Quit or restart.

## Dev console

The console replaces the menu. Press `~` (the key under Escape, above Tab) to open or close it. Double-click a command in the history to run it again.

| Command | What it does |
| --- | --- |
| `RestartLevel` | Generates a new dungeon and respawns Ember |
| `Quit` | Quits the game |
| `RefillHatred` | Refills Hatred to the maximum (100) |
| `SetFireRate <seconds>` | Sets the wait between shots. Must be greater than 0. |

## What to focus on

- Explore every room in a dungeon, then restart and explore a new one.
- Clear rooms both ways: by buttons and by killing enemies.
- Use the console to push the rules and see what the game allows.
- Try combining actions and see how the game handles it.

## Reporting what you find

1. Post it in Discord first, so the room knows.
2. Log a Jira ticket with:
   - steps anyone could follow to see it
   - what you expected, and what happened instead
   - a screenshot or clip
   - the build number: **260904r1**
3. If you're not sure whether something is a bug or on purpose, ask the room.
