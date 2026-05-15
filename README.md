# Wartoad

Wartoad is a card game about seizing control of the pond!

Upgrade leaves floating on the pond, deploy units, and use them to capture your opponent's home leaf to win.

## Project directory structure

Directories are "ordered" as follows. Files in later directories may only import from earlier ones.

src:

- types: basic types -- only uses type imports only from the same directory
- state-types: types and constants for store/context state and convenience functions for operating on those types
- view: React components which import no other components and don't use context or state
- state: state to be provided by store/context
- actions: action and/or reducer functions for modifying store/context state
- context: React contexts and relevant custom hooks, for direct use in any component
- basic: React components which import only components from src/view and may use context and/or state
- composite: React components which import some other components

Also:

- src/state/game imports all the other state files
- src/action/game imports all the other action files
- Files in src/composite may import eachother for now.
- Files in src/types may type-import eachother for now.
- Game.tsx composes all components of the game. It is presentational/structural.
- App.tsx provides top level context and state for Game.tsx, which it imports. It is an entrypoint and provides wiring but should have minimal logic.
- In other subdirectories, files of the same directory may not import eachother.