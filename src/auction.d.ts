declare global {
  interface Work {
    id: number
    name: string
    description: string
    img: string
    minBid: number
    hidden: boolean
  }

  interface WorkDetail extends Work {
    highestBid: Bid | null
  }

  interface BidBase {
    id: number
    amount: number
    timestamp: number
    userName: string
  }

  interface Bid extends BidBase {
    obfsPhone: string
  }

  interface BidAdmin extends BidBase {
    phone: string
  }

  interface Config {
    isOpen: boolean
  }
}

export { }
