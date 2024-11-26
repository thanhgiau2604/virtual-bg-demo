let outputCanvasCtx: CanvasRenderingContext2D | null = null
let effectType: 'blur' | 'video' | 'image' = 'blur'
let backgroundImage: HTMLImageElement | null = null
let backgroundVideo: HTMLVideoElement | null = null
let foregroundType: 'normal' | 'presenter' = 'normal'
let presenterModeOffset = 0

const foregroundCanvasElement = document.createElement('canvas')
const backgroundCanvasElement = document.createElement('canvas')
const backgroundCanvasCtx = backgroundCanvasElement.getContext('2d')

export async function segmentBackground(
  inputVideoElement: HTMLVideoElement,
  outputCanvasElement: HTMLCanvasElement,
  modelSelection: 0 | 1 = 1
) {
  foregroundCanvasElement.width = backgroundCanvasElement.width = outputCanvasElement.width
  foregroundCanvasElement.height = backgroundCanvasElement.height = outputCanvasElement.height
  outputCanvasCtx = outputCanvasElement.getContext('2d')

  // @ts-ignore
  const selfieSegmentation = new SelfieSegmentation({
    locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
    },
  })

  selfieSegmentation.setOptions({
    modelSelection: modelSelection,
  })

  selfieSegmentation.onResults((results: any) => {
    mergeForegroundBackground(foregroundCanvasElement, backgroundCanvasElement, results)
  })

  inputVideoElement.addEventListener('play', () => {
    async function step() {
      await selfieSegmentation.send({ image: inputVideoElement })
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

function mergeForegroundBackground(
  foregroundCanvasElement: HTMLCanvasElement,
  backgroundCanvasElement: HTMLCanvasElement,
  results: any
) {
  makeCanvasLayer(results, foregroundCanvasElement, 'foreground')
  if (effectType === 'blur')
    makeCanvasLayer(results, backgroundCanvasElement, 'background')
  else if (effectType === 'image' && backgroundImage) {
    backgroundCanvasCtx?.drawImage(
      backgroundImage,
      0,
      0,
      backgroundCanvasElement.width,
      backgroundCanvasElement.height
    )
  } else if (effectType === 'video' && backgroundVideo) {
    backgroundCanvasCtx?.drawImage(
      backgroundVideo,
      0,
      0,
      backgroundCanvasElement.width,
      backgroundCanvasElement.height
    )
  }
  outputCanvasCtx?.drawImage(backgroundCanvasElement, 0, 0)
  if (foregroundType === 'presenter')
    outputCanvasCtx?.drawImage(
      foregroundCanvasElement,
      foregroundCanvasElement.width * 0.5 - presenterModeOffset,
      foregroundCanvasElement.height * 0.5,
      foregroundCanvasElement.width * 0.5,
      foregroundCanvasElement.height * 0.5
    )
  else outputCanvasCtx?.drawImage(foregroundCanvasElement, 0, 0)
}

function makeCanvasLayer(results: any, canvasElement: HTMLCanvasElement, type: 'foreground' | 'background') {
  const canvasCtx = canvasElement.getContext('2d')
  if (!canvasCtx) return

  canvasCtx.save()

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
  canvasCtx.drawImage(
    results.segmentationMask,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  )
  if (type === 'foreground') {
    canvasCtx.globalCompositeOperation = 'source-in'
  }

  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  )

  canvasCtx.restore()
}

export function applyBlur(blurIntensity = 7) {
  effectType = 'blur'
  foregroundType = 'normal'
  if (backgroundCanvasCtx) {
    backgroundCanvasCtx.filter = `blur(${blurIntensity}px)`
  }
}

export function applyImageBackground(image: HTMLImageElement) {
  backgroundImage = image
  foregroundType = 'normal'
  effectType = 'image'
}

export function applyVideoBackground(video: HTMLVideoElement) {
  backgroundVideo = video
  video.autoplay = true
  video.loop = true
  video.addEventListener('play', () => {
    video.muted = true
  })
  effectType = 'video'
}

export function applyScreenBackground(stream: MediaStream) {
  const videoElement = document.createElement('video')
  videoElement.srcObject = stream
  backgroundVideo = videoElement

  videoElement.autoplay = true
  videoElement.loop = true
  videoElement.addEventListener('play', () => {
    videoElement.muted = true
  })
  effectType = 'video'
}

export function changeForegroundType(type: 'normal' | 'presenter', offset = 0) {
  foregroundType = type
  presenterModeOffset = offset
}
