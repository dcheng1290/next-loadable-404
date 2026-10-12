import { shared } from './shared'
import { pageShared } from './pageShared'
import { lazyOnly } from './lazyOnly'
export const Lazy = () => <p id="lazy">{shared('a')} {pageShared('b')} {lazyOnly('c')}</p>
