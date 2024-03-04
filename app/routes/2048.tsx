import type { LinksFunction, MetaFunction } from '@vercel/remix'
import type { CSSProperties } from 'react'
import { Fragment, useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { bcls } from '~/lib/bcls'
import { START_TILES, addRandomTile, game2048Store, move } from '~/store/2048Store'
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
        move(direction)
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
    <section>
      <div className="game-board">
        <Cells key="cells" />
        <Tiles />
      </div>
    </section>
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
      className="tile"
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
        <div
          className="tile"
          key={merged.key}
        >
          {merged.value}
        </div>
      ))}
    </Fragment>
  )
}

function Cells() {
  const { cells } = useSnapshot(game2048Store)

  return (
    <Fragment>
      {cells.map((_, index) => (
        <div className="cell" key={index} />
      ))}
    </Fragment>
  )
}
