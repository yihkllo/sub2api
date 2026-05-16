<template>
  <div class="starlight-bg" />
  <canvas ref="canvasRef" class="starlight-canvas" aria-hidden="true" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Star {
  x: number
  y: number
  r: number
  vy: number
  vx: number
  drift: number
  twinkle: number
  alpha: number
  tail: number
  tint: string
}

interface Palette {
  core: string
  glow: string
  spark: string
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

let raf = 0
let last = 0
let width = 0
let height = 0
const stars: Star[] = []
let palette: Palette = { core: '255, 255, 255', glow: '143, 181, 255', spark: '255, 178, 221' }

function readPalette(): Palette {
  const isDark = document.documentElement.classList.contains('dark')
  if (isDark) {
    return { core: '255, 255, 255', glow: '143, 181, 255', spark: '255, 178, 221' }
  }
  return { core: '255, 255, 255', glow: '48, 112, 216', spark: '224, 72, 151' }
}

function createStar(x = Math.random() * width, y = -24, scattered = false): Star {
  const animeTint = Math.random() < 0.18
  return {
    x,
    y: scattered ? y : -Math.random() * height * 0.25 - 12,
    r: Math.random() * 1.9 + 0.55,
    vy: Math.random() * 14 + 7,
    vx: Math.random() * 5 - 2.5,
    drift: Math.random() * Math.PI * 2,
    twinkle: Math.random() * Math.PI * 2,
    alpha: Math.random() * 0.42 + 0.18,
    tail: Math.random() * 18 + 10,
    tint: animeTint ? palette.spark : palette.glow,
  }
}

function seedStars() {
  stars.length = 0
  const count = Math.round(Math.min(96, Math.max(42, (width * height) / 18500)))
  for (let i = 0; i < count; i++) {
    stars.push(createStar(Math.random() * width, Math.random() * height, true))
  }
}

function drawStar(ctx: CanvasRenderingContext2D, star: Star, time: number) {
  const pulse = 0.64 + Math.sin(time * 0.002 + star.twinkle) * 0.22
  const alpha = Math.max(0.06, star.alpha * pulse)
  const tailX = star.x - star.vx * 1.4
  const tailY = star.y - star.tail

  const trail = ctx.createLinearGradient(star.x, star.y, tailX, tailY)
  trail.addColorStop(0, `rgba(${star.tint}, ${alpha * 0.42})`)
  trail.addColorStop(1, `rgba(${star.tint}, 0)`)

  ctx.strokeStyle = trail
  ctx.lineWidth = Math.max(0.5, star.r * 0.55)
  ctx.beginPath()
  ctx.moveTo(star.x, star.y)
  ctx.lineTo(tailX, tailY)
  ctx.stroke()

  const halo = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 8)
  halo.addColorStop(0, `rgba(${palette.core}, ${alpha * 0.82})`)
  halo.addColorStop(0.22, `rgba(${star.tint}, ${alpha * 0.35})`)
  halo.addColorStop(1, `rgba(${star.tint}, 0)`)

  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(star.x, star.y, star.r * 8, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `rgba(${palette.core}, ${Math.min(0.86, alpha + 0.18)})`
  ctx.beginPath()
  ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
  ctx.fill()
}

onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const media = window.matchMedia('(prefers-reduced-motion: reduce)')

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    seedStars()
  }

  const frame = (time: number) => {
    const delta = Math.min(32, time - last || 16) / 1000
    last = time
    ctx.clearRect(0, 0, width, height)
    ctx.globalCompositeOperation = 'lighter'

    for (const star of stars) {
      star.drift += delta * 0.85
      star.twinkle += delta * 1.8
      star.x += (star.vx + Math.sin(star.drift) * 5) * delta
      star.y += star.vy * delta
      drawStar(ctx, star, time)

      if (star.y > height + 42 || star.x < -42 || star.x > width + 42) {
        Object.assign(star, createStar())
      }
    }

    ctx.globalCompositeOperation = 'source-over'
    raf = requestAnimationFrame(frame)
  }

  const start = () => {
    cancelAnimationFrame(raf)
    palette = readPalette()
    ctx.clearRect(0, 0, width, height)

    if (media.matches) {
      for (const star of stars) {
        drawStar(ctx, star, 0)
      }
      return
    }

    last = 0
    raf = requestAnimationFrame(frame)
  }

  const refreshTheme = () => {
    palette = readPalette()
    seedStars()
    start()
  }

  const observer = new MutationObserver(refreshTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  window.addEventListener('resize', resize)
  media.addEventListener('change', start)
  resize()
  start()

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    observer.disconnect()
    window.removeEventListener('resize', resize)
    media.removeEventListener('change', start)
  })
})
</script>

<style scoped>
.starlight-bg {
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background:
    radial-gradient(circle at 16% 10%, rgba(125, 140, 255, 0.2), transparent 30rem),
    radial-gradient(circle at 84% 24%, rgba(255, 178, 221, 0.15), transparent 28rem),
    radial-gradient(circle at 44% 94%, rgba(89, 214, 204, 0.1), transparent 29rem),
    linear-gradient(180deg, #101426, #171b31 48%, #231c31);
}

.starlight-canvas {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  width: 100%;
  height: 100%;
}
</style>
