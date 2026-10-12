import dynamic from 'next/dynamic'
import { shared } from '../components/shared'

const Lazy = dynamic(() => import('../components/Lazy').then((m) => m.Lazy))

export default function App({ Component, pageProps }) {
  return (
    <>
      <span>{shared('app')}</span>
      <Lazy />
      <Component {...pageProps} />
    </>
  )
}
