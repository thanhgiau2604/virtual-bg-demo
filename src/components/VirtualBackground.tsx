'use client'

import { useEffect, useRef } from 'react'
import { segmentBackground, applyImageBackground } from '../utils/virtualBackgroundUtils'

interface VirtualBackgroundProps {
  inputVideoElement: HTMLVideoElement
  outputCanvasElement: HTMLCanvasElement
}

export default function VirtualBackground({ inputVideoElement, outputCanvasElement }: VirtualBackgroundProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (!scriptRef.current) {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/selfie_segmentation.js'
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)
      scriptRef.current = script

      script.onload = () => {
        segmentBackground(inputVideoElement, outputCanvasElement)

        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.src = 'https://i0.wp.com/picjumbo.com/wp-content/uploads/green-natural-background-with-trees-and-wooden-foundation-free-image.jpeg?w=600&quality=80'
        image.onload = () => {
          applyImageBackground(image)
        }
      }
    }

    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current)
      }
    }
  }, [inputVideoElement, outputCanvasElement])

  return null
}
