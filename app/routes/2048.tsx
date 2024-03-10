import type { LinksFunction, MetaFunction } from '@vercel/remix'
import type { CSSProperties } from 'react'
import { Fragment, useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { bcls } from '~/lib/bcls'
import { ts2HMS } from '~/lib/time'
import { COLS, ROWS, START_TILES, addRandomTile, game2048Store, move, restartGame, undo } from '~/store/2048Store'
import type { Direction, Tile as ITile } from '~/store/2048Store'
import gameStyle from '~/styles/2048.css'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: gameStyle },
]

export const meta: MetaFunction = () => {
  return [
    { title: '2048' },
    { name: 'description', content: '2048 game' },
  ]
}

export default function Game() {
  // Effect run twice in React strict mode
  // Using a trick way to ensure effect runs once
  const effectRunOncePlease = useRef(false)
  // Effect run once
  useEffect(() => {
    if (effectRunOncePlease.current)
      return
    effectRunOncePlease.current = true

    for (let i = 0; i < START_TILES; i++)
      addRandomTile()
  }, [])
  useEffect(() => {
    const MOVE_UP = /^(ArrowUp|w|k)$/
    const MOVE_RIGHT = /^(ArrowRight|d|l)$/
    const MOVE_DOWN = /^(ArrowDown|s|j)$/
    const MOVE_LEFT = /^(ArrowLeft|a|h)$/

    function listen(event: KeyboardEvent) {
      const modifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey

      if (modifier)
        return

      // 0 for up, 1 for right, 2 for down, 3 for left
      let direction: Direction | null = null

      switch (true) {
        case MOVE_UP.test(event.key):
          direction = 0
          break
        case MOVE_RIGHT.test(event.key):
          direction = 1
          break
        case MOVE_DOWN.test(event.key):
          direction = 2
          break
        case MOVE_LEFT.test(event.key):
          direction = 3
          break
      }
      if (direction !== null) {
        event.preventDefault()
        requestAnimationFrame(() => {
          move(direction!)
        })
        // move(direction)
      }
      if (event.key === 'r') {
        // TODO replay
      }
    }
    window.addEventListener('keydown', listen)

    return () => {
      window.removeEventListener('keydown', listen)
    }
  }, [])

  return (
    <section className="game-2048-container">
      <Panel />
      <div className="game-board">
        <Cells />
        <Tiles />
      </div>
    </section>
  )
}

function Score() {
  const { score, bestScore } = useSnapshot(game2048Store)

  return (
    <div className="grid grid-cols-2 gap-1 font-bold">
      <div className="flex flex-col items-center justify-center rounded-[1vmin] bg-[#8f7a66] text-[#f5f5dc]">
        <p className="text-xs">BEST</p>
        <p>{bestScore}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-[1vmin] bg-[#8f7a66] text-[#f5f5dc]">
        <p className="text-xs">SCORE</p>
        <p>{score}</p>
      </div>
    </div>
  )
}

function StepTimer() {
  const { moved, lastTimestamp, over } = useSnapshot(game2048Store)
  const { minutes, seconds } = ts2HMS(lastTimestamp)

  useEffect(() => {
    if (over)
      return

    const game2048TimerId = setTimeout(() => {
      game2048Store.lastTimestamp += 1000
    }, 1000)

    return () => {
      clearTimeout(game2048TimerId)
    }
  }, [lastTimestamp])

  return (
    <div className="space-y-1 text-[#DADADA]">
      <div className="flex justify-between rounded-[1vmin] bg-[#4a4a4a] px-2">
        <p>MOVES</p>
        <p>{moved}</p>
      </div>
      <div className="flex justify-between rounded-[1vmin] bg-[#4a4a4a] px-2">
        <p>TIME</p>
        <p>
          {minutes}
          :
          {seconds}
        </p>
      </div>
    </div>
  )
}

function Action() {
  const { canUndo } = useSnapshot(game2048Store)

  return (
    <div className="grid grid-cols-2 gap-1 text-[1.6rem] text-[#f0f0f0]">
      <button onClick={restartGame} className="flex items-center justify-center rounded-[1vmin] bg-[#e74c3c] hover:bg-[#ff6e57] focus:bg-[#f39c12]">NEW</button>
      <button onClick={undo} disabled={!canUndo} className="flex items-center justify-center rounded-[1vmin] bg-[#e74c3c] hover:bg-[#ff6e57] focus:bg-[#f39c12] disabled:cursor-not-allowed disabled:bg-[#bdc3c7] disabled:text-[#ecf0f1]">UNDO</button>
    </div>
  )
}

function Panel() {
  return (
    <div className="game-panel grid grid-cols-2 grid-rows-2 gap-1">
      <p className="flex items-center justify-center rounded-[1vmin] bg-[#f5f5dc] text-[clamp(2.4rem,5vw,2.4rem)] font-bold text-[#5d4037]">2048</p>

      <Score />

      <StepTimer />

      <Action />
    </div>
  )
}

function Tiles() {
  const { cells } = useSnapshot(game2048Store)
  const tiles = cells.filter(Boolean) as ITile[]

  return (
    <Fragment>
      {tiles.map((tile) => {
        return (
          <Fragment key={tile.key}>
            <MergedTiles tile={tile} />
            <Tile tile={tile} />
          </Fragment>
        )
      })}
    </Fragment>
  )
}

function Tile({ tile }: { tile: ITile }) {
  const style: CSSProperties = {
    '--x': tile.x,
    '--y': tile.y,
  }

  if (tile.prevPosition) {
    style['--prev-x'] = tile.prevPosition.x
    style['--prev-y'] = tile.prevPosition.y
  }

  return (
    <div
      className={bcls(
        'tile',
        `tile-${tile.value}`,
        tile.mergedFrom && 'tile-merged',
        tile.prevPosition && 'tile-moved',
        !tile.mergedFrom && !tile.prevPosition && 'tile-new',
      )}
      style={style}
    >
      {tile.value}
    </div>
  )
}

function MergedTiles({ tile }: { tile: ITile }) {
  if (!tile.mergedFrom)
    return null

  return (
    <Fragment>
      {tile.mergedFrom.map(merged => (
        <Tile key={merged.key} tile={merged} />
      ))}
    </Fragment>
  )
}

function Cells() {
  const cells = []

  for (let i = 0; i < ROWS * COLS; i++)cells.push(i)

  return (
    <Fragment>
      {cells.map(index => <div className="cell" key={index} />)}
    </Fragment>
  )
}
