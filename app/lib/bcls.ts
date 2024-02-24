type Part = undefined | false | null | string

export function bcls(...parts: Part[]): string {
  return parts.filter(Boolean).join(' ')
}
