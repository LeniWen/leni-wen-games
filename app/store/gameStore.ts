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
  key: string
  mergedFrom?: [Tile, Tile]
}
type Cell = Tile | null
interface GameManager {
  cells: Cell[]
  score: number
  bestScore: number
  over: boolean
  won: boolean
}
export type Direction = 0 | 1 | 2 | 3
interface ReverseTag {
  x: -1 | 0 | 1
  y: -1 | 0 | 1

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

function createTile(position: Position, value: Tile['value']): Tile {
  return {
    ...position,
    value,
    key: crypto.randomUUID(),
  }
}

function insertTile(tile: Tile) {
  gameStore.cells[tile.x + tile.y * COLS] = tile
}

function clearTile(tile: Tile) {
  gameStore.cells[tile.x + tile.y * COLS] = null
}

function moveTile(tile: Tile, p: Position) {
  gameStore.cells[tile.x + tile.y * COLS] = null
  tile.x = p.x
  tile.y = p.y
  gameStore.cells[p.x + p.y * COLS] = tile
}

function buildTraverseDirection(tag: ReverseTag) {
  const traverse: { x: number[], y: number[] } = {
    x: [],
    y: [],
  }

  for (let i = 0; i < ROWS; i++)
    traverse.x.push(i)
  for (let j = 0; j < COLS; j++)
    traverse.y.push(j)
  if (tag.x === 1)
    traverse.x.reverse()
  if (tag.y === 1)
    traverse.y.reverse()

  return traverse
}

function getDirectionTag(direction: Direction) {
  const map: Record<Direction, ReverseTag> = {
    0: { x: 0, y: -1 }, // up
    1: { x: 1, y: 0 }, // right
    2: { x: 0, y: 1 }, // down
    3: { x: -1, y: 0 }, // left
  }

  return map[direction]
}

function withinBounds(p: Position) {
  return p.x >= 0 && p.x < ROWS && p.y >= 0 && p.y < COLS
}

/**
 * move tiles by direction
 * @param direction 0 for up, 1 for right, 2 for down, 3 for left
 */
export function move(direction: Direction) {
  if (gameStore.over || gameStore.won)
    return

  const directionTag = getDirectionTag(direction)
  const traverse = buildTraverseDirection(directionTag)
  let mergeTo: Position | null = null
  let moveTo: Position | null = null
  let moved = false

  // prepareTiles()
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const tile = gameStore.cells[i + j * COLS]

      if (tile)
        tile.mergedFrom = undefined
    }
  }
  traverse.x.forEach((x) => {
    traverse.y.forEach((y) => {
      const tile = gameStore.cells[x + y * COLS]

      if (tile) {
        let p = { x, y }

        do {
          moveTo = p
          p = {
            x: p.x + directionTag.x,
            y: p.y + directionTag.y,
          }
          mergeTo = p
        } while (withinBounds(p) && !gameStore.cells[p.x + p.y * COLS])

        // while (withinBounds(p) && !gameStore.cells[p.x + p.y * COLS]) {
        //   moveTo = p
        //   p = {
        //     x: p.x + directionTag.x,
        //     y: p.y + directionTag.y,
        //   }
        //   mergeTo = p
        // }
        // TODO comments
        if (mergeTo && !withinBounds(mergeTo))
          mergeTo = null

        const mergeToCell = mergeTo
          ? gameStore.cells[mergeTo.x + mergeTo.y * COLS]
          : null

        if (mergeToCell && mergeToCell.value === tile.value && !tile.mergedFrom) {
          const merged = createTile(mergeToCell, tile.value * 2)

          merged.mergedFrom = [tile, mergeToCell]
          insertTile(merged)
          clearTile(tile)
          gameStore.score += merged.value
        }
        else if (moveTo) {
          moveTile(tile, moveTo)
          moved = true
        }
      }
    })
  })
  if (moved) {
    // game over ?
    addRandomTile()
  }
}
