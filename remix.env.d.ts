/// <reference types="@remix-run/dev" />
/// <reference types="@vercel/remix" />

import 'react'

type anyFunction = (...args: any) => any

interface Window {
  fakeStorage?: {
    _data: Map<string, string>
    setItem: Storage['setItem']
    removeItem: Storage['removeItem']
    getItem: Storage['getItem']
    clear: Storage['clear']
  }
}

type CustomProp = { [key in `--${string}`]: string | number }
declare module 'react' {
  export interface CSSProperties extends CustomProp {}
}
