// <reference types="node" />

declare module 'windows-shortcuts-ps' {
  // eslint-disable-next-line import/prefer-default-export
  export function getPath(path: string): Promise<string>;
}
