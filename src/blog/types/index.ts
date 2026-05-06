export interface Post {
  slug: string
  title: string
  description: string
  content: string
  date: string
  author: string
  category: string
  tags: string[]
  readTime: number
  featured: boolean
  seo: {
    title: string
    description: string
    image?: string
  }
}

export interface Category {
  slug: string
  name: string
  description: string
  count: number
}

export interface Comment {
  id: string
  author: string
  email: string
  content: string
  date: string
  approved: boolean
}

export interface SearchQuery {
  term: string
  category?: string
  tag?: string
}