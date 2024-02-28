import type { LinksFunction, MetaFunction } from '@vercel/remix'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { bcls } from '~/lib/bcls'
import type { Direction, Tile } from '~/store/gameStore'
import { START_TILES, addRandomTile, gameStore, move } from '~/store/gameStore'
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
  // React.effect run twice in React strict mode.
  // Using a trick way to ensure effect runs once.
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
        <Fragment key="cells">
          {cells.map((_, index) => {
            return (
              <div className="cell" key={index} />
            )
          })}
        </Fragment>
        {(cells.filter(Boolean) as Tile[]).map((tile) => {
          return (
            <div
              className={bcls('tile')}
              style={{ '--x': tile.x, '--y': tile.y }}
              key={tile.key}
            >
              {tile.value}
            </div>
          )
        })}
      </div>
    </section>
  )
}
