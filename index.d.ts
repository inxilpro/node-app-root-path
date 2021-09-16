declare namespace appRootPath {
  export function resolve(pathToModule: string): string
  export function require(pathToModule: string): any
  export function toString(): string
  export function setPath(explicitlySetPath: string): void
  export const path: string
}
export = appRootPath
