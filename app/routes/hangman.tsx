import { Link } from '@remix-run/react'
import type { MetaFunction } from '@vercel/remix'

export const meta: MetaFunction = () => {
  return [
    { title: 'hangman game' },
    { name: 'description', content: 'hangman game | frontend mentor challenge' },
  ]
}

export default function Hangman() {
  return (
    <div className="relative grid h-screen grid-rows-[2fr,65%,1fr] overflow-auto bg-hangman px-6 tablet:px-20">
      <div aria-hidden />
      <div
        className="relative grid grid-rows-[25%,1fr,15%] rounded-[3rem] tablet:mx-auto tablet:w-[31rem]"
        style={{
          backgroundImage: 'linear-gradient(180deg, #344ABA 0%, rgba(0, 20, 121, 0.83) 100%)',
          boxShadow: 'inset 0px -8px 0px 4px #140E66, inset 0px 6px 0px 8px #2463FF',
        }}
      >
        <img loading="lazy" decoding="async" src="/images/hangman/logo.svg" alt="logo" className="absolute left-1/2 top-0 max-w-[90%] -translate-x-1/2 -translate-y-1/2" />
        <div aria-hidden />
        <div className="flex flex-col justify-between px-8">
          <Link
            to="category"
            className="mx-auto rounded-full p-14"
            style={{
              backgroundImage: 'linear-gradient(180deg, #FE71FE 16.42%, #7199FF 100%)',
              boxShadow: 'inset 0px -4px 0px 5px #243041, inset 0px -12px 0px 11px #9D2DF5',
            }}
          >
            <img src="/images/hangman/icon-play.svg" alt="play" />
          </Link>
          <Link
            to="how-to-play"
            style={{
              boxShadow: 'inset 0px -2px 0px 3px #140E66, inset 0px 1px 0px 6px #3C74FF',
            }}
            className="mx-auto w-full max-w-64 rounded-[2.5rem] bg-[#2463ff] py-3 text-center text-3xl text-white"
            type="submit"
          >
            HOW TO PLAY
          </Link>
        </div>
        <div aria-hidden />
      </div>
      <div aria-hidden />
    </div>
  )
}
