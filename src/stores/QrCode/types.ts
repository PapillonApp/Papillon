export interface QrCode {
  id: string
  name: string
  data: string
}

export interface QrCodeStore {
  codes: QrCode[]

  addQrCode: (name: string, data: string) => QrCode
  removeQrCode: (id: string) => void
  getQrCode: (id: string) => QrCode | undefined
  getAllQrCodes: () => QrCode[]
}