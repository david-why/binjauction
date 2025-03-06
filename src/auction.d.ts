declare global {
  interface Work {
    id: string
    name: string
    description: string
    img: string
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

  interface User {
    id: string
    name: string
    role: number
    phone: string
  }

  type UserObfuscated = Omit<User, 'phone'> & { obfsPhone: string }

  interface UserLogin {
    id: string
    code: string
    user_id: string
    expires_at: number
  }
}

export { }
