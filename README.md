# Neon Courier

A cyberpunk-themed puzzle game built with React. Navigate through 10 challenging levels, collect data chips, avoid drones and lasers, and complete your deliveries!

## Support This Project

If you enjoy this game, consider supporting the development:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/hanryckbrar)

**Want to learn how this game was built with AI?** Check out the [tutorial and extras](https://buymeacoffee.com/hanryckbrar/extras)!

## Game Features

- **10 Progressive Levels**: From simple tutorials to complex multi-chip challenges
- **Dynamic Obstacles**:
  - Patrol drones that detect and chase you
  - Rotating lasers
  - Power panels and doors
  - Gaps to jump over
  - Teleportation tunnels
- **Retro Aesthetics**: Neon visuals with procedural audio
- **Multiple Mechanics**: Movement, stealth, puzzles, and timing challenges

## How to Run

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Controls

- **WASD** or **Arrow Keys**: Move
- **E**: Interact with power panels and tunnels
- **Space**: Jump over gaps
- **ESC**: Pause game
- **Enter**: Select menu options / Continue to next level

## Game Mechanics

### Chips & Delivery
- Collect glowing cyan chips (◆)
- Deliver them to the yellow delivery zone (□)
- Later levels require multiple chips!

### Drones
- Red patrol drones follow set paths
- Stay outside their detection radius (red circle)
- If detected, they chase you at higher speed
- Getting caught restarts the level

### Lasers
- Red rotating beams that catch you on contact
- Time your movement carefully
- Watch the rotation patterns

### Power Panels
- Green panels activate when you press **E**
- Open connected red doors
- Plan your route through security systems

### Gaps
- Dark void areas you can't walk across
- Press **Space** near the edge to jump
- Available in later levels

### Tunnels
- Blue swirling portals
- Press **E** on entrance to teleport to exit
- Useful for avoiding patrols

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Tech Stack

- **React** - UI framework
- **Tailwind CSS** - Styling
- **HTML5 Canvas** - Game rendering
- **Vite** - Build tool and dev server

## Credits

Built with AI assistance. Learn how to create your own game at [buymeacoffee.com/hanryckbrar/extras](https://buymeacoffee.com/hanryckbrar/extras)

## License

This project is open source and available for educational purposes.

## Enjoy the Game!

Complete all 10 levels and master the art of the Neon Courier!
