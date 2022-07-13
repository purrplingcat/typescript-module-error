export function mapObject<T>(arr: T[], selector: (v: T) => PropertyKey) {
  return arr.reduce((acc, val) => ({ ...acc, [selector(val)]: val }), {})
}
