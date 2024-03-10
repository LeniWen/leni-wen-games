import { proxy } from 'valtio'

export const NOTIFICATION_2048_TAG = '2048'
export const ROWS = 4
export const COLS = 4
export const START_TILES = 2
const WON_SCORE = 2048
/**
 * Each tile's value is 2 or 4, the possibility of 2 is 90%
 */
const TWO_POSSIBILITY = 0.9

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
  prevPosition?: Position
}
type Cell = Tile | null
interface Store {
  cells: Cell[]
  score: number
  bestScore: number
  over: boolean
  won: boolean
  moved: number
  lastTimestamp: number
  canUndo?: boolean
}
export enum Direction {
  Up,
  Right,
  Down,
  Left,
}
interface MoveDirection {
  x: -1 | 0 | 1
  y: -1 | 0 | 1
}

export const game2048Store = proxy<Store>({
  cells: Array(ROWS * COLS).fill(null),
  score: 0,
  bestScore: 0,
  moved: 0,
  over: false,
  won: false,
  lastTimestamp: 0,
})

export function restartGame() {
  Object.assign(game2048Store, {
    cells: Array(ROWS * COLS).fill(null),
    score: 0,
    moved: 0,
    over: false,
    won: false,
    lastTimestamp: 0,
    bestScore: game2048Store.bestScore,
  })
  for (let i = 0; i < START_TILES; i++)
    addRandomTile()
}

export function undo() {
  const originalCells = game2048Store.cells

  game2048Store.canUndo = false
  game2048Store.cells = Array(ROWS * COLS).fill(null)
  originalCells.forEach((tile) => {
    if (!tile)
      return
    if (tile.mergedFrom) {
      tile.mergedFrom.forEach((mergedTile) => {
        if (mergedTile.prevPosition)
          insertTile(createTile({ x: mergedTile.prevPosition.x, y: mergedTile.prevPosition.y }, mergedTile.value))
      })
    }
    else if (tile.prevPosition) {
      insertTile(createTile({ x: tile.prevPosition.x, y: tile.prevPosition.y }, tile.value))
    }
  })
}

function availableCells(): Position[] {
  const positions = []

  for (let x = 0; x < ROWS; x++) {
    for (let y = 0; y < COLS; y++) {
      if (!getCell({ x, y }))
        positions.push({ x, y })
    }
  }

  return positions
}

function createTile(position: Position, value: Tile['value']): Tile {
  return {
    ...position,
    value,
    key: crypto.randomUUID(),
  }
}

function insertTile(tile: Tile) {
  game2048Store.cells[tile.x + tile.y * COLS] = tile
}

function clearTile(tile: Tile) {
  game2048Store.cells[tile.x + tile.y * COLS] = null
}

export function addRandomTile() {
  const cells = availableCells()

  if (cells.length) {
    const value = Math.random() < TWO_POSSIBILITY ? 2 : 4
    const index = Math.floor(Math.random() * cells.length)
    const tile = createTile(cells[index], value)

    insertTile(tile)
  }
  else {
    throw new Error('No room to add a tile')
  }
}

/**
 * The direction of tile movement
 *
 * @example
 *
 * Initial grid cells:
 * 0 2 0 2
 * After pressing the Arrow Right key:
 * 0 0 0 4
 * All tiles move to the right, and identical tiles merge together
 */
function getTileMoveDirection(direction: Direction): MoveDirection {
  const map: Record<Direction, MoveDirection> = {
    [Direction.Up]: { x: 0, y: -1 },
    [Direction.Right]: { x: 1, y: 0 },
    [Direction.Down]: { x: 0, y: 1 },
    [Direction.Left]: { x: -1, y: 0 },
  }

  return map[direction]
}

/**
 * Creates the order for traversing grid cells based on the direction of tile movement
 * This function determines the sequence in which grid cells should be visited when tiles
 * are moving in a particular direction
 *
 * @example
 *
 * Initial grid cells:
 * 0 2 0 2
 * 4 2 4 0
 * After pressing the Arrow Right key:
 * Traversal order changes to ensure tiles move and merge correctly:
 * 0 0 0 4
 * 0 4 2 4
 */
function createTraversalOrder(moveDirection: MoveDirection) {
  const traverse: { x: number[], y: number[] } = { x: [], y: [] }

  for (let x = 0; x < ROWS; x++)
    traverse.x.push(x)
  for (let y = 0; y < COLS; y++)
    traverse.y.push(y)
  if (moveDirection.x === 1)
    traverse.x.reverse()
  if (moveDirection.y === 1)
    traverse.y.reverse()

  return traverse
}

function withinBounds(p: Position): boolean {
  return p.x >= 0 && p.x < ROWS && p.y >= 0 && p.y < COLS
}

function cellAvailable(p: Position): boolean {
  return !!getCell(p)
}

function prepareTiles() {
  game2048Store.cells.forEach((cell) => {
    if (!cell)
      return
    cell.prevPosition = { x: cell.x, y: cell.y }
    delete cell.mergedFrom
  })
}

function moveTile(tile: Tile, p: Position) {
  game2048Store.cells[tile.x + tile.y * COLS] = null
  game2048Store.cells[p.x + p.y * COLS] = tile
  tile.x = p.x
  tile.y = p.y
}

function getCell(p: Position) {
  return game2048Store.cells[p.x + p.y * COLS]
}

function canMove(): boolean {
  if (availableCells().length)
    return true
  for (let x = 0; x < ROWS; x++) {
    for (let y = 0; y < COLS; y++) {
      const tile = getCell({ x, y })

      if (!tile)
        continue

      for (let direction = 0; direction < 4; direction++) {
        const moveDirection = getTileMoveDirection(direction)
        const anotherTile = getCell({ x: x + moveDirection.x, y: y + moveDirection.y })

        if (anotherTile && withinBounds(anotherTile) && anotherTile.value === tile.value)
          return true // These two tiles can be merged
      }
    }
  }

  return false
}

export function move(direction: Direction) {
  // if (game2048Store.over || game2048Store.won)
  if (game2048Store.over)
    return

  prepareTiles()

  const moveDirection = getTileMoveDirection(direction)
  const traverse = createTraversalOrder(moveDirection)
  let moved = false

  traverse.x.forEach((x) => {
    traverse.y.forEach((y) => {
      // The farthest position to which the tile can move without merging
      let farthest: Position = { x, y }
      const tile = getCell(farthest)

      if (!tile)
        return

      // The next position where a merge is possible
      let next: Position | null = { x: x + moveDirection.x, y: y + moveDirection.y }

      while (withinBounds(next) && !cellAvailable(next)) {
        farthest = next
        next = { x: next.x + moveDirection.x, y: next.y + moveDirection.y }
      }

      const nextTile = withinBounds(next) ? getCell(next) : null

      if (nextTile && !nextTile.mergedFrom && nextTile.value === tile.value) { // merge
        const merged = createTile(next, tile.value * 2)

        merged.mergedFrom = [tile, nextTile]

        insertTile(merged)
        clearTile(tile)

        tile.x = nextTile.x
        tile.y = nextTile.y
        game2048Store.score += merged.value

        if (game2048Store.bestScore < game2048Store.score)
          game2048Store.bestScore = game2048Store.score

        if (merged.value === WON_SCORE)
          game2048Store.won = true
      }
      else { // move
        moveTile(tile, farthest)
      }
      if (!(tile.x === x && tile.y === y)) { // not the same position
        moved = true
      }
    })
  })
  if (moved) {
    addRandomTile()

    game2048Store.moved += 1
    game2048Store.canUndo = true

    if (!canMove())
      game2048Store.over = true
  }
}
