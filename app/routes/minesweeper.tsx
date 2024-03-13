import type { LinksFunction } from '@vercel/remix'
import type { MouseEvent } from 'react'
import { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import gameStyle from '../styles/minesweeper.css'
import { bcls } from '~/lib/bcls'
import { minesweeperStore } from '~/store/minesweeperStore'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: gameStyle },
]

export default function Page() {
  useEffect(() => {
    minesweeperStore.setup(9, 9, 'beginner')
  })

  return (
    <section>
      <h1>Minesweeper</h1>
      <Board />
    </section>
  )
}

function Board() {
  const { board, cols, rows } = useSnapshot(minesweeperStore)

  return (
    <div
      className="board"
      style={{ '--rows': rows, '--cols': cols }}
      onClick={minesweeperStore.onLeftMouseClick.bind(minesweeperStore)}
      onContextMenu={minesweeperStore.onRightMouseClick.bind(minesweeperStore)}
    >
      {board.map((cell, index) => (
        <div
          className={bcls('cell', cell.revealed && !cell.hasMine && cell.adjacentMines === 0 && 'cell-empty', cell.revealed && cell.hasMine && 'cell-mine', cell.revealed && cell.adjacentMines > 0 && `cell-number-${cell.adjacentMines}`)}
          data-x={index % cols}
          data-y={Math.floor(index / rows)}
          key={cell.key}
        >
          {cell.revealed && cell.hasMine && '💣'}
          {cell.revealed && cell.adjacentMines > 0 && cell.adjacentMines}
          {/* {cell.revealed && cell.adjacentMines === 0 && <span className="cell-empty" />} */}
        </div>
      ),
      )}
    </div>
  )
}
