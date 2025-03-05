declare global {
  declare interface Work {
    id: string
    name: string
    description: string
    img: string
  }

  declare interface WorkDetail extends Work {
    highestBid: Bid | null
  }

  declare interface Bid {
    id: string
    amount: number
    user: Omit<User, 'phone'>
    timestamp: number
  }

  declare interface User {
    id: string
    name: string
    role: number
    phone: string
  }
}

export { }
