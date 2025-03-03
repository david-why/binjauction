declare global {
  declare interface Work {
    id: string
    name: string
    description: string
    img: string
    highestBid: Omit<Bid, "phone">
  }

  declare interface Bid {
    id: string
    amount: number
    name: string
    phone: string
    timestamp: number
  }
}

export { }
