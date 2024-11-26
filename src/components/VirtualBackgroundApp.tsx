'use client'

import { useEffect, useRef, useState } from 'react'
import VirtualBackground from './VirtualBackground'
import styles from '../app/page.module.css'

export default function VirtualBackgroundApp() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function getMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error("Error accessing the camera:", err)
      }
    }

    getMedia()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleCapture = () => {
    if (canvasRef.current) {
      // Get the computed style of the canvas
      const computedStyle = window.getComputedStyle(canvasRef.current);
      // Get the visible dimensions of the canvas
      const visibleWidth = parseInt(computedStyle.width);
      const visibleHeight = parseInt(computedStyle.height);

      // Create a new canvas with the visible dimensions
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = visibleWidth;
      tempCanvas.height = visibleHeight;

      // Draw the visible portion of the original canvas onto the new canvas
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx?.drawImage(
        canvasRef.current,
        0, 0, canvasRef.current.width, canvasRef.current.height,
        0, 0, visibleWidth, visibleHeight
      );

      // Create download link
      const link = document.createElement('a');
      link.download = 'virtual-background.png';
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <>
      <div className={styles.container}>
        <video ref={videoRef} autoPlay playsInline muted id="inputVideoElement" />
        <canvas ref={canvasRef} width={1280} height={720} id="output_canvas" />
      </div>
      <button onClick={handleCapture} className={styles.captureButton}>Capture and Download</button>
      {stream && videoRef.current && canvasRef.current && (
        <VirtualBackground
          inputVideoElement={videoRef.current}
          outputCanvasElement={canvasRef.current}
        />
      )}
    </>
  )
}
