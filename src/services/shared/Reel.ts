export interface Reel {
  id: string
  timestamp: number
  /** base64 encoded */
  image: string
  imagewithouteffect: string

  subjectdata: {
    color: string,
    pretty: string,
    emoji: string,
  }

  grade: {
    value: string,
    outOf: string,
    coef: string,
  }
}
