# PolyglotChess

**PolyglotChess** is a state-of-the-art, monorepo-based chess platform designed to showcase the power of framework-agnostic core logic. By decoupling the FIDE-compliant chess engine from the presentation layer, PolyglotChess drives three distinct 3D frontends—**React**, **Svelte**, and **Vue**—using the exact same underlying logic. Built with a focus on modern aesthetics, 3D immersion, and reactive state management, it serves as a blueprint for high-performance, multi-framework web architectures.

---

## 🏗 Architecture Overview

The system is architected as a **Monorepo** using npm workspaces, separating the "brain" of the application from its "eyes."

-   **@chess/core**: A vanilla TypeScript library that wraps `chess.js` to provide move validation, game state, and FIDE rule enforcement. It uses a custom **PubSub** implementation to provide a reactive API that any framework can subscribe to.
-   **Frontends**:
    -   **React**: Powered by `react-three-fiber` and `drei` for high-fidelity 3D rendering.
    -   **Svelte**: Utilizing `threlte` for a declarative, performant 3D experience.
    -   **Vue**: Leveraging `tresjs` to bring Vue's reactivity to the 3D canvas.
-   **Design System**: TailwindCSS is used across all packages, featuring a **Glassmorphism** aesthetic with rich backdrop blurs and premium HSL color palettes.
-   **Build & Deploy**: Powered by **Vite** for lightning-fast development and a unified **GitHub Actions** pipeline for automatic deployment to GitHub Pages.

---

## 🖼 Visuals

> [!TIP]
> ### Preview Suggestions
> *   **Classic Marble Theme**: A screenshot of the React frontend showcasing the "Classic Marble" 3D pieces with smooth glass-like UI overlays.
> *   **Cyberpunk Neon**: A GIF of a move being made in the Vue/TresJS environment with neon trails and glowing borders.
> *   **Multi-View Comparison**: A collage showing the same game state rendered simultaneously in React, Svelte, and Vue.

---

## 🚀 Installation & Setup

### Prerequisites
-   **Node.js**: v18.0.0 or higher
-   **npm**: v8.0.0 or higher

### Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/polyglot-chess.git
    cd polyglot-chess
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Build the core library**:
    ```bash
    npm run build:core
    ```

4.  **Run a frontend locally**:
    ```bash
    # For React
    npm run dev:react

    # For Svelte
    npm run dev:svelte

    # For Vue
    npm run dev:vue
    ```

---

## 🛠 Usage Examples

### Using the @chess/core Engine
The core engine is framework-agnostic. You can initialize it, make moves, and subscribe to updates:

```typescript
import { ChessEngine } from '@chess/core';

const engine = new ChessEngine();

// Subscribe to board changes
engine.events.subscribe('boardUpdate', (state) => {
  console.log('New Board FEN:', state.fen);
  console.log('Turn:', state.turn);
});

// Make a move (SAN or Coordinates)
engine.move('e4');
engine.move({ from: 'e7', to: 'e5' });

// Get current status
const status = engine.getGameStatus();
if (status.isCheckmate) {
  console.log('Winner:', status.winner);
}
```

---

## 📂 Directory Structure

```text
.
├── packages/
│   ├── core/           # Vanilla TS game logic & PubSub wrapper
│   ├── ui-react/       # React + React Three Fiber frontend
│   ├── ui-svelte/      # Svelte + Threlte frontend
│   └── ui-vue/         # Vue + TresJS frontend
├── tsconfig.base.json  # Shared TypeScript configuration
├── package.json        # Workspace & monorepo scripts
└── .gitignore          # standard git ignores
```

---

## 🤝 Contribution & License

### Contributing
We welcome contributions! Please follow these steps:
1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

### License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

*Built with ❤️ by the PolyglotChess Team.*
