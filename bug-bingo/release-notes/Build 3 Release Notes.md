# Ember · Build 3 Release Notes

<sub>Build file: `_CURRENT_260918r0.zip`</sub>

The next Ember prototype. It adds bombs, new enemy types and behaviours, more rooms, and a much bigger dev console. Every level should still be fully explorable, as long as you complete each room's condition.

## Start here: retest your Build 2 tickets

Before hunting for new bugs, go back through the tickets you logged on Build 2. For each one, try your own steps on this build and add a Jira comment saying one of:

- **Fixed:** you can't make it happen any more.
- **Still there:** it happens the same way, or differently (say how).
- **Can't tell:** explain what's stopping you from checking.

## New since Build 2

- **Bombs.** Press `E` to drop a bomb where Ember is standing. It explodes after a few seconds. Enemies and Ember caught in the blast should show damage. You start with 4.
- **Enemy types and behaviours.** Enemies can now wander, chase Ember or stay put.
- **More rooms.** There are more room layouts for the dungeon to use.
- **A new dev console.** The Build 2 commands have been replaced:
  - `RefillHatred` is now `Weapon.CurrentHatred <amount>`.
  - `SetFireRate` is now `Weapon.FireRate <seconds>`.
  - There are many new settings for the player, weapon, projectiles and rooms (see below).
  - The console suggests commands above the command line. Double-click one to load it.
- **Hatred (ammo)** now starts at 200, and each shot costs 0.01.

## Controls

Keyboard and mouse.

| Control | Action |
| --- | --- |
| WASD | Move (8 directions) |
| Spacebar | Roll in the direction you're moving |
| E | Drop a bomb |
| Mouse position | Aim |
| Left click | Shoot. Hold to keep firing. |
| Tilde (`~`) | Open or close the dev console |

## How it works

**Movement.** Ember walks in eight directions with a walk animation for each. Rolling plays a roll animation in the direction you're moving. Room walls should stop Ember leaving the playable area.

**Weapon.** The gun points at your mouse. Each shot fires a projectile in that direction, and holding the button fires at a set rate. Projectiles disappear when they hit something.

**Bombs.** A bomb drops at Ember's position, waits a few seconds, then explodes. Anything in the blast radius should show damage.

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

The console replaces the menu. Press `~` (the key under Escape, above Tab) to open or close it. Double-click a command in the history (below the command line) to run it again. Double-click a suggestion (above the command line) to load it.

| Command | What it does | Default |
| --- | --- | --- |
| `Emitter.AngleOffset <degrees>` | Rotates the emitter, and the direction projectiles fire | 0 |
| `Emitter.Count <number>` | How many emitters the weapon has | 1 |
| `Emitter.Radius <distance>` | How far from the gun projectiles start | 0.5 |
| `Player.BombCount <number>` | How many bombs Ember is carrying | 4 |
| `Player.MoveSpeed <speed>` | How fast Ember moves | 5 |
| `Player.RollSpeed <speed>` | How fast Ember rolls | 500 |
| `Player.RollControl <amount>` | How much you can steer while rolling | 0.2 |
| `Projectile.Damage <amount>` | How much damage each projectile does | 10 |
| `Projectile.HatredCost <amount>` | How much Hatred each shot costs | 0.01 |
| `Projectile.Speed <speed>` | How fast projectiles move | 10 |
| `Quit` | Quits the game | |
| `RestartLevel` | Reloads the level | |
| `Room.Deactivate` | Deactivates the room Ember is in. It can't be turned back on. | |
| `Weapon.CurrentHatred <amount>` | Sets current Hatred | 200 |
| `Weapon.FireRate <seconds>` | Minimum time between shots | 0.2 |

## What to focus on

- Retest your Build 2 tickets first (see the top of these notes).
- Use bombs everywhere: on enemies, on yourself, and near walls, doors and objects.
- Watch how each enemy behaviour reacts to you.
- Explore the new rooms from the very start of a run.
- Listen as well as look. Sounds count too.
- Push the new console settings to their limits.

## Reporting what you find

1. Post it in Discord first, so the room knows.
2. Log a Jira ticket with:
   - steps anyone could follow to see it
   - what you expected, and what happened instead
   - a screenshot or clip
   - the build number: **260918r0**
3. If you're not sure whether something is a bug or on purpose, ask the room.
