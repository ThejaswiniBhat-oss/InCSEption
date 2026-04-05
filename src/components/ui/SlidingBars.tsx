"use client"

import { useEffect, useRef, useCallback } from "react"

interface SlidingBarsProps {
  backgroundColor?: string
  lineColor?: string
  barColor?: string
  lineWidth?: number
  animationSpeed?: number
  removeWaveLine?: boolean
}

const SlidingBars = ({
  backgroundColor = "#0e0c0a",
  lineColor = "rgba(210,190,150,0.07)",
  barColor = "#c8b89a",
  lineWidth = 1,
  animationSpeed = 0.004,
  removeWaveLine = true,
}: SlidingBarsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef<number>(0)
  const animationFrameId = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })
  const transitionBursts = useRef<Array<{ x: number; y: number; time: number; intensity: number }>>([])
  const dprRef = useRef<number>(1)

  interface Bar { y: number; height: number; width: number }

  const noise = (x: number, y: number, t: number): number => {
    const n =
      Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t) +
      Math.sin(x * 0.03 - t) * Math.cos(y * 0.01 + t)
    return (n + 1) / 2
  }

  const getMouseInfluence = (x: number, y: number): number => {
    const dx = x - mouseRef.current.x
    const dy = y - mouseRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return Math.max(0, 1 - distance / 180)
  }

  const getTransitionBurstInfluence = (x: number, y: number, currentTime: number): number => {
    let total = 0
    transitionBursts.current.forEach((burst) => {
      const age = currentTime - burst.time
      const maxAge = 2500
      if (age < maxAge) {
        const dx = x - burst.x
        const dy = y - burst.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const burstRadius = (age / maxAge) * 300
        const burstWidth = 60
        if (Math.abs(distance - burstRadius) < burstWidth) {
          const strength = (1 - age / maxAge) * burst.intensity
          const proximity = 1 - Math.abs(distance - burstRadius) / burstWidth
          total += strength * proximity
        }
      }
    })
    return Math.min(total, 1.5)
  }

  const generatePattern = (seed: number, width: number, height: number, numLines: number): Bar[][] => {
    const pattern: Bar[][] = []
    const lineSpacing = width / numLines
    for (let i = 0; i < numLines; i++) {
      const lineBars: Bar[] = []
      let currentY = 0
      while (currentY < height) {
        const noiseVal = noise(i * lineSpacing, currentY, seed)
        if (noiseVal > 0.5) {
          const barLength = 10 + noiseVal * 30
          const barWidth = 2 + noiseVal * 3
          lineBars.push({ y: currentY + barLength / 2, height: barLength, width: barWidth })
          currentY += barLength + 15
        } else {
          currentY += 15
        }
      }
      pattern.push(lineBars)
    }
    return pattern
  }

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr
    const displayWidth = canvas.parentElement?.clientWidth || window.innerWidth
    const displayHeight = canvas.parentElement?.clientHeight || window.innerHeight
    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    canvas.style.width = displayWidth + "px"
    canvas.style.height = displayHeight + "px"
    const ctx = canvas.getContext("2d")
    if (ctx) ctx.scale(dpr, dpr)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseRef.current.x = e.clientX - rect.left
    mouseRef.current.y = e.clientY - rect.top
  }, [])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    mouseRef.current.isDown = true
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    transitionBursts.current.push({ x, y, time: Date.now(), intensity: 2 })
    const now = Date.now()
    transitionBursts.current = transitionBursts.current.filter((b) => now - b.time < 2500)
  }, [])

  const handleMouseUp = useCallback(() => { mouseRef.current.isDown = false }, [])

  // Touch support
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas || !e.touches[0]) return
    const rect = canvas.getBoundingClientRect()
    mouseRef.current.x = e.touches[0].clientX - rect.left
    mouseRef.current.y = e.touches[0].clientY - rect.top
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas || !e.touches[0]) return
    const rect = canvas.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const y = e.touches[0].clientY - rect.top
    transitionBursts.current.push({ x, y, time: Date.now(), intensity: 2 })
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const currentTime = Date.now()
    timeRef.current += animationSpeed

    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const numLines = Math.floor(width / 15)
    const lineSpacing = width / numLines

    const pattern1 = generatePattern(0, width, height, numLines)
    const pattern2 = generatePattern(5, width, height, numLines)

    const baseCycleTime = timeRef.current % (Math.PI * 2)
    const mouseInfluenceOnCycle = getMouseInfluence(width / 2, height / 2) * 0.5
    const adjustedCycleTime = baseCycleTime + mouseInfluenceOnCycle

    let easingFactor: number
    if (adjustedCycleTime < Math.PI * 0.1) {
      easingFactor = 0
    } else if (adjustedCycleTime < Math.PI * 0.9) {
      easingFactor = (adjustedCycleTime - Math.PI * 0.1) / (Math.PI * 0.8)
    } else if (adjustedCycleTime < Math.PI * 1.1) {
      easingFactor = 1
    } else if (adjustedCycleTime < Math.PI * 1.9) {
      easingFactor = 1 - (adjustedCycleTime - Math.PI * 1.1) / (Math.PI * 0.8)
    } else {
      easingFactor = 0
    }

    const smoothEasing =
      easingFactor < 0.5
        ? 4 * easingFactor * easingFactor * easingFactor
        : 1 - Math.pow(-2 * easingFactor + 2, 3) / 2

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    for (let i = 0; i < numLines; i++) {
      const x = i * lineSpacing + lineSpacing / 2
      const lineMouseInfluence = getMouseInfluence(x, height / 2)

      ctx.beginPath()
      ctx.strokeStyle = lineColor
      ctx.lineWidth = lineWidth + lineMouseInfluence * 1.5
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()

      const bars1 = pattern1[i] || []
      const bars2 = pattern2[i] || []
      const maxBars = Math.max(bars1.length, bars2.length)

      for (let j = 0; j < maxBars; j++) {
        let bar1 = bars1[j]
        let bar2 = bars2[j]
        if (!bar1) bar1 = { y: bar2.y - 100, height: 0, width: 0 }
        if (!bar2) bar2 = { y: bar1.y + 100, height: 0, width: 0 }

        const barMouseInfluence = getMouseInfluence(x, bar1.y)
        const burstInfluence = getTransitionBurstInfluence(x, bar1.y, currentTime)

        const baseWaveOffset =
          Math.sin(i * 0.3 + j * 0.5 + timeRef.current * 2) * 10 * (smoothEasing * (1 - smoothEasing) * 4)
        const mouseWaveOffset = barMouseInfluence * Math.sin(timeRef.current * 3 + i * 0.2) * 15
        const burstWaveOffset = burstInfluence * Math.sin(timeRef.current * 4 + j * 0.3) * 20
        const totalWaveOffset = baseWaveOffset + mouseWaveOffset + burstWaveOffset

        const y = bar1.y + (bar2.y - bar1.y) * smoothEasing + totalWaveOffset
        const h = bar1.height + (bar2.height - bar1.height) * smoothEasing + barMouseInfluence * 5 + burstInfluence * 8
        const w = bar1.width + (bar2.width - bar1.width) * smoothEasing + barMouseInfluence * 2 + burstInfluence * 3

        if (h > 0.1 && w > 0.1) {
          const intensity = Math.min(1, 0.72 + barMouseInfluence * 0.28 + burstInfluence * 0.3)
          const r = parseInt(barColor.slice(1, 3), 16)
          const g = parseInt(barColor.slice(3, 5), 16)
          const b = parseInt(barColor.slice(5, 7), 16)
          ctx.fillStyle = `rgba(${r},${g},${b},${intensity})`
          ctx.fillRect(x - w / 2, y - h / 2, w, h)
        }
      }
    }

    if (!removeWaveLine) {
      transitionBursts.current.forEach((burst) => {
        const age = currentTime - burst.time
        if (age < 2500) {
          const progress = age / 2500
          ctx.beginPath()
          ctx.strokeStyle = `rgba(200,184,154,${(1 - progress) * 0.15 * burst.intensity})`
          ctx.lineWidth = 1.5
          ctx.arc(burst.x, burst.y, progress * 300, 0, 2 * Math.PI)
          ctx.stroke()
        }
      })
    }

    animationFrameId.current = requestAnimationFrame(animate)
  }, [backgroundColor, lineColor, barColor, lineWidth, animationSpeed, removeWaveLine])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    resizeCanvas()
    const handleResize = () => resizeCanvas()

    window.addEventListener("resize", handleResize)
    canvas.addEventListener("mousemove", handleMouseMove as EventListener)
    canvas.addEventListener("mousedown", handleMouseDown as EventListener)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("touchmove", handleTouchMove as EventListener, { passive: true })
    canvas.addEventListener("touchstart", handleTouchStart as EventListener, { passive: true })

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      canvas.removeEventListener("mousemove", handleMouseMove as EventListener)
      canvas.removeEventListener("mousedown", handleMouseDown as EventListener)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("touchmove", handleTouchMove as EventListener)
      canvas.removeEventListener("touchstart", handleTouchStart as EventListener)
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
      timeRef.current = 0
      transitionBursts.current = []
    }
  }, [animate, resizeCanvas, handleMouseMove, handleMouseDown, handleMouseUp, handleTouchMove, handleTouchStart])

  return (
    <div style={{
      position: "absolute", inset: 0,
      width: "100%", height: "100%",
      overflow: "hidden", backgroundColor,
    }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  )
}

export default SlidingBars
