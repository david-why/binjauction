declare global {
  interface Work {
    id: string
    name: string
    description: string
    img: string
    minBid: number
    hidden: boolean
  }

  interface WorkDetail extends Work {
    highestBid: Bid | null
  }

  interface Bid {
    id: string
    amount: number
    user: UserObfuscated
    timestamp: number
  }

  interface UserBase {
    id: string
    name: string
    role: number
  }

  interface User extends UserBase {
    phone: string
  }

  interface UserObfuscated extends UserBase {
    obfsPhone: string
    isSelf: boolean
  }

  interface UserLogin {
    id: string
    code: string
    user_id: string
    expires_at: number
  }
}

export { }
