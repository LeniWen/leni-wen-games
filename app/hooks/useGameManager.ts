import { proxy } from 'valtio'

export const ROWS = 4
export const COLS = 4
export const START_TILES = 2
const TWO_POSSIBILITY = 0.9
// const GAME_STATE_KEY = '2048_state_key'
// const GAME_BEST_SCORE_KEY = '2048_best_score_key'

interface Position {
  x: number
  y: number
}
export interface Tile {
  x: Position['x']
  y: Position['y']
  value: number
  prevPosition: Position | null
}
type Cell = Tile | null
interface GameManager {
  cells: Cell[]
  score: number
  bestScore: number
  over: boolean
  won: boolean
}

export const gameStore = proxy<GameManager>({
  cells: Array(ROWS * COLS).fill(null),
  score: 0,
  bestScore: 0,
  over: false,
  won: false,
})

function availableCells(): Position[] {
  const cells = []

  for (let x = 0; x < ROWS; x++) {
    for (let y = 0; y < COLS; y++) {
      if (!gameStore.cells[x + y * COLS])
        cells.push({ x, y })
    }
  }

  return cells
}

export function addRandomTile() {
  const cells = availableCells()

  if (cells.length) {
    const value = Math.random() < TWO_POSSIBILITY ? 2 : 4
    const index = Math.floor(Math.random() * cells.length)
    const tile = createTile(cells[index], value)

    insertTile(tile)
  }
}

function createTile(position: Position, value = 2): Tile {
  return {
    ...position,
    value,
    prevPosition: null,
  }
}

function insertTile(tile: Tile) {
  gameStore.cells[tile.x + tile.y * COLS] = tile
}
