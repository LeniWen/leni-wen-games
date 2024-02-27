import type { LinksFunction, MetaFunction } from '@vercel/remix'
import { Fragment, useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'
import type { Tile } from '~/store/gameStore'
import { ROWS, START_TILES, addRandomTile, gameStore } from '~/store/gameStore'
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
  const { cells } = useSnapshot(gameStore)
  const effectRunOncePlease = useRef(false)

  useEffect(() => {
    if (effectRunOncePlease.current)
      return
    effectRunOncePlease.current = true

    for (let i = 0; i < START_TILES; i++)
      addRandomTile()

    return () => {}
  }, [])

  return (
    <section>
      <div className="game-board">
        <Fragment key="cells">
          {cells.map((_, index) => {
            return (
              <div className="cell" key={index} />
            )
          })}
        </Fragment>
        {/* THIS IS UGLY */}
        {(cells.filter(Boolean) as Tile[]).map((tile) => {
          const key = tile.x * ROWS + tile.y
          return (
            <div className="tile" style={{ '--x': tile.x, '--y': tile.y }} key={key}>{tile!.value}</div>
          )
        })}
      </div>
    </section>
  )
}
