'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const DynamicVirtualBackgroundApp = dynamic(() => import('./VirtualBackgroundApp'), {
  ssr: false,
  loading: () => <p>Loading...</p>
})

export default function VirtualBackgroundWrapper() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DynamicVirtualBackgroundApp />
    </Suspense>
  )
}

