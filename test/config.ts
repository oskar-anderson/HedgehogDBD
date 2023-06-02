import crypto from 'crypto'

// stupid stuff to get Jest working - https://stackoverflow.com/questions/52612122/how-to-use-jest-to-test-functions-using-crypto-or-window-mscrypto
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: (options: crypto.RandomUUIDOptions | undefined) => crypto.randomUUID(options)
  }
});