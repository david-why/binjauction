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
    user: UserObfuscated
    timestamp: number
  }

  declare interface User {
    id: string
    name: string
    role: number
    phone: string
  }

  declare type UserObfuscated = Omit<User, 'phone'> & { obfsPhone: string }

  declare interface UserLogin {
    id: string
    code: string
    user_id: string
    expires_at: number
  }
}

export { }
