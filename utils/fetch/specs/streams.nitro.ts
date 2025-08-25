import { getHybridObjectConstructor, HybridObject } from 'react-native-nitro-modules'

export interface InputStream extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  read(): Promise<ArrayBuffer>

  open(): void
  close(): void
}

export interface OutputStream extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  write(buffer: ArrayBuffer): Promise<void>

  open(): void
  close(): void
}

interface DuplexStream extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  inputStream: InputStream
  outputStream: OutputStream
}

export const DuplexStream = getHybridObjectConstructor<DuplexStream>('DuplexStream')
