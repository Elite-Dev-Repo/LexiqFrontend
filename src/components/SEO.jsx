import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Lexiq'
const SITE_URL = 'https://lexiq.app'
const DEFAULT_DESC = 'Learn and master vocabulary through real-time multiplayer quiz battles. Challenge friends, track your progress, and expand your word bank.'
const OG_IMAGE = `${SITE_URL}/og-image.png`

export default function SEO({ title, description = DEFAULT_DESC, image = OG_IMAGE, url }) {
  const pageTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Vocabulary Quizzes`
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
