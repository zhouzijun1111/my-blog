/**
 * SEO 工具函数
 * 生成结构化数据和 meta 标签
 */

/**
 * 文章结构化数据类型
 */
export interface ArticleStructuredData {
  '@context': string
  '@type': string
  headline: string
  description: string
  author: {
    '@type': string
    name: string
  }
  datePublished: string
  dateModified: string
  image?: string
  url?: string
  publisher?: {
    '@type': string
    name: string
    logo?: {
      '@type': string
      url: string
    }
  }
}

/**
 * 生成文章的结构化数据（JSON-LD）
 * 用于 SEO，帮助搜索引擎理解文章内容
 */
export function generateArticleStructuredData(article: {
  title: string
  excerpt?: string
  content?: string
  createdAt: string
  updatedAt: string
  author?: { username: string }
  slug: string
  coverImage?: string
}): ArticleStructuredData {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const url = `${baseUrl}/articles/${article.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.content?.substring(0, 160) || article.title,
    author: {
      '@type': 'Person',
      name: article.author?.username || '一剑轻安'
    },
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    ...(article.coverImage && { image: article.coverImage }),
    url,
    publisher: {
      '@type': 'Organization',
      name: '一剑轻安的博客',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    }
  }
}

/**
 * 网站 Meta 标签类型
 */
export interface MetaTags {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  keywords?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

/**
 * 生成 Open Graph Meta 标签
 * 用于社交媒体分享时显示预览信息
 */
export function generateMetaTags(meta: MetaTags) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const url = meta.url || (typeof window !== 'undefined' ? window.location.href : baseUrl)
  const defaultImage = `${baseUrl}/og-image.png`
  const image = meta.image || defaultImage

  return {
    // 基础 Meta 标签
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,

    // Open Graph / Facebook
    'og:type': meta.type || 'website',
    'og:title': meta.title,
    'og:description': meta.description,
    'og:image': image,
    'og:url': url,

    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:title': meta.title,
    'twitter:description': meta.description,
    'twitter:image': image,

    // 文章特殊 Meta 标签
    ...(meta.type === 'article' && {
      'article:published_time': meta.publishedTime,
      'article:modified_time': meta.modifiedTime,
      'article:author': meta.author
    })
  }
}

/**
 * 生成 BreadcrumbList 结构化数据
 */
export function generateBreadcrumbStructuredData(breadcrumbs: {
  name: string
  url: string
}[]) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url.startsWith('http') ? breadcrumb.url : `${baseUrl}${breadcrumb.url}`
    }))
  }
}

/**
 * 生成 Website 结构化数据
 */
export function generateWebsiteStructuredData() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '一剑轻安的博客',
    url: baseUrl,
    description: '探索技术深度，分享编程智慧',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

/**
 * 生成 Organization 结构化数据
 */
export function generateOrganizationStructuredData() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '一剑轻安的博客',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`
    },
    sameAs: [
      // 社交媒体链接
      // 'https://github.com/yourusername',
      // 'https://twitter.com/yourusername'
    ]
  }
}

/**
 * 注入 JSON-LD 到页面头部
 * 用于在 Vue 组件中动态注入结构化数据
 */
export function injectJSONLD(data: any) {
  if (typeof document === 'undefined') return

  // 移除旧的 JSON-LD
  const oldScript = document.getElementById('structured-data')
  if (oldScript) {
    oldScript.remove()
  }

  // 添加新的 JSON-LD
  const script = document.createElement('script')
  script.id = 'structured-data'
  script.type = 'application/ld+json'
  script.text = JSON.stringify(data)
  document.head.appendChild(script)
}
