import { NitroModules, type HybridObject } from 'react-native-nitro-modules'
import { InputStream } from './streams.nitro';

export type RequestMethods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
export type RequestRedirection = 'follow' | 'manual'

export interface NativeRequest {
  url: string
  method: RequestMethods
  redirection: RequestRedirection
  headers: Array<string>
  body: InputStream | null
}

export interface NativeResponse {
  url: string
  status: number
  statusText: string
  headers: Array<string>
  body: InputStream | null
  redirected: boolean
}

interface Fetch extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  create(opts: NativeRequest): Promise<NativeResponse>
}

export const Fetch = NitroModules.createHybridObject<Fetch>("Fetch");
