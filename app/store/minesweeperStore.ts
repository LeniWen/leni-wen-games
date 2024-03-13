import { proxy } from 'valtio'
import type { MouseEvent } from 'react'

type Level = 'beginner' | 'intermediate' | 'expert'
interface Cell {
  hasMine: boolean
  revealed: boolean
  flagged: boolean
  adjacentMines: number
  key: string
}
interface Position {
  x: number
  y: number
}

class MinesweeperManager {
  rows: number
  cols: number
  private mines: number
  private level: Level
  board: Cell[]
  isFirstRevealed: boolean
  won: boolean
  over: boolean

  constructor() {
    this.rows = 0
    this.cols = 0
    this.mines = 0
    this.board = []
    this.level = 'beginner'
    this.isFirstRevealed = true
    this.won = false
    this.over = false
  }

  setup(rows: number, cols: number, level: Level) {
    this.rows = rows
    this.cols = cols
    this.level = level
    this.mines = this.calculateMines()
    this.board = this.initBoard()
  }

  fillBoard(firstRevealedCell: Position) {
    let minesPlaced = 0

    while (minesPlaced < this.mines) {
      const x = Math.floor(Math.random() * this.cols)
      const y = Math.floor(Math.random() * this.rows)
      const cell = this.getCell({ x, y })

      if (!cell.hasMine || (firstRevealedCell.x === x && firstRevealedCell.y === y)) {
        cell.hasMine = true
        minesPlaced += 1
      }
    }

    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const cell = this.getCell({ x, y })

        if (!cell.hasMine)
          continue

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0)
              continue

            const nx = x + dx
            const ny = y + dy
            const np = { x: nx, y: ny }

            if (!this.withinBound(np))
              continue

            const cell = this.getCell(np)

            if (!cell.hasMine)
              cell.adjacentMines += 1
          }
        }
      }
    }
  }

  onLeftMouseClick(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault()

    const target = e.target as HTMLDivElement
    const currentTarget = e.currentTarget

    if (target === currentTarget)
      return

    const x = Number.parseInt(target.getAttribute('data-x') as string)
    const y = Number.parseInt(target.getAttribute('data-y') as string)
    const p = { x, y }

    if (this.isFirstRevealed) {
      this.isFirstRevealed = false
      this.fillBoard(p)
    }

    const cell = this.getCell(p)

    if (cell.revealed)
      return
    if (cell.flagged) {
      cell.flagged = false
      return
    }

    cell.revealed = true
  }

  onRightMouseClick(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  private getCell(p: Position) {
    return this.board[p.x + p.y * this.cols]
  }

  private withinBound(p: Position) {
    return p.x >= 0 && p.x < this.cols && p.y >= 0 && p.y < this.rows
  }

  private initBoard() {
    const board: Cell[] = []

    for (let x = 0; x < this.rows; x++) {
      for (let y = 0; y < this.cols; y++) {
        board.push({
          hasMine: false,
          revealed: false,
          flagged: false,
          adjacentMines: 0,
          key: crypto.randomUUID(),
        })
      }
    }

    // for (let i = 0; i < this.rows * this.cols; i++) {
    //   board.push({
    //     hasMine: false,
    //     revealed: false,
    //     flagged: false,
    //     adjacentMines: 0,
    //     key: crypto.randomUUID(),
    //   })
    // }

    return board
  }

  private calculateMines() {
    let percentage

    switch (this.level) {
      case 'beginner': {
        percentage = 0.1
        break
      }
      case 'intermediate': {
        percentage = 0.15
        break
      }
      case 'expert': {
        percentage = 0.2
        break
      }
      default: {
        throw new Error('Invalid level specified.')
      }
    }

    return Math.floor(this.rows * this.cols * percentage)
  }
}

export const minesweeperStore = proxy(new MinesweeperManager())
