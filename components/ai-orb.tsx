"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"

export type OrbState = "idle" | "wake_listening" | "wake_detected" | "recording" | "transcribing" | "planning" | "executing" | "generating_response" | "speaking" | "recovering" | "error" | string

export function AIOrb({ state }: { state: OrbState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function syncSize() {
      const w = canvas!.clientWidth || 1280
      const h = canvas!.clientHeight || 720
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w
        canvas!.height = h
      }
    }
    
    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize)
      resizeObserver.observe(canvas)
    }
    syncSize()

    const gl = canvas.getContext('webgl') || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null)
    if (!gl) return

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`
    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_colorBlue;
uniform vec3 u_colorIndigo;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float d = length(uv);
    
    float pulse = 0.5 + 0.5 * sin(u_time * 3.0 + d * 5.0);
    float jitter = noise(uv * 10.0 + u_time * 10.0) * 0.02;
    
    float ring1 = 0.02 / abs(d - (0.4 + 0.05 * sin(u_time * 2.0)));
    float ring2 = 0.01 / abs(d - (0.42 + 0.03 * cos(u_time * 4.0)));
    float ring3 = 0.005 / abs(d - (0.45 + 0.01 * sin(u_time * 8.0)));
    
    vec2 st = uv;
    st *= rotate2d(u_time * 0.5 + d * 2.0);
    float swirl = sin(atan(st.y, st.x) * 8.0 + u_time * 5.0);
    float filaments = smoothstep(0.8, 1.0, swirl) * (0.1 / d);
    
    float core = 0.1 / (d + 0.01);
    core *= 0.5 + 0.5 * sin(u_time * 15.0);
    
    vec3 finalColor = mix(u_colorBlue, u_colorIndigo, d);
    
    float intensity = (ring1 + ring2 + ring3 + filaments + core) * pulse;
    finalColor *= intensity;
    
    float scanline = sin(gl_FragCoord.y * 0.5 + u_time * 20.0) * 0.05;
    finalColor += scanline * u_colorBlue;
    
    float alpha = smoothstep(0.8, 0.1, d);
    
    gl_FragColor = vec4(finalColor, alpha);
}`
    function cs(type: number, src: string) {
      const s = gl!.createShader(type)
      if (!s) return null
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      return s
    }
    const prog = gl.createProgram()
    if (!prog) return
    const vShader = cs(gl.VERTEX_SHADER, vs)
    const fShader = cs(gl.FRAGMENT_SHADER, fs)
    if (!vShader || !fShader) return
    gl.attachShader(prog, vShader)
    gl.attachShader(prog, fShader)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
    
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_resolution')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')
    const uColorBlue = gl.getUniformLocation(prog, 'u_colorBlue')
    const uColorIndigo = gl.getUniformLocation(prog, 'u_colorIndigo')

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 }
    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width
        const ny = 1.0 - (event.clientY - rect.top) / rect.height
        mouse.x = nx * canvas.width
        mouse.y = ny * canvas.height
      }
    }
    window.addEventListener('mousemove', onMouseMove)

    let animationFrameId: number
    const startTime = Date.now()
    
    function render() {
      if (typeof ResizeObserver === 'undefined') syncSize()
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
      const t = Date.now() - startTime
      if (uTime) gl!.uniform1f(uTime, t * 0.001)
      if (uRes) gl!.uniform2f(uRes, canvas!.width, canvas!.height)
      if (uMouse) gl!.uniform2f(uMouse, mouse.x, mouse.y)
      
      // Determine colors based on state
      // Default: Jarvis Cyan/Blue
      let colorBlue = [0.0, 0.6, 1.0]
      let colorIndigo = [0.388, 0.4, 0.945]
      
      // Dynamic colors!
      if (state === "executing") {
        colorBlue = [1.0, 0.6, 0.0] // Amber
        colorIndigo = [0.945, 0.4, 0.388] // Reddish
      } else if (state === "planning") {
        colorBlue = [0.0, 1.0, 0.6] // Greenish
        colorIndigo = [0.388, 0.945, 0.4] 
      } else if (state === "speaking") {
        colorBlue = [1.0, 0.0, 0.8] // Pink/Magenta
        colorIndigo = [0.6, 0.0, 1.0] 
      } else if (state === "error") {
        colorBlue = [1.0, 0.0, 0.0] // Red
        colorIndigo = [0.5, 0.0, 0.0] 
      }

      if (uColorBlue) gl!.uniform3f(uColorBlue, colorBlue[0], colorBlue[1], colorBlue[2])
      if (uColorIndigo) gl!.uniform3f(uColorIndigo, colorIndigo[0], colorIndigo[1], colorIndigo[2])

      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
      animationFrameId = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animationFrameId)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [state])

  // Define animation variants based on state to wrap the canvas
  const variants = {
    idle: {
      scale: 1,
      boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
    },
    wake_listening: {
      scale: 1,
      boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
    },
    recording: {
      scale: 1.15,
      boxShadow: "0 0 60px rgba(99, 102, 241, 0.8)",
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "reverse" as const }
    },
    transcribing: {
      scale: [1, 1.05, 1],
      rotate: [0, 180, 360],
      boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)",
      transition: { repeat: Infinity, duration: 2, ease: "linear" }
    },
    wake_detected: {
      scale: [1, 1.05, 1],
      rotate: [0, 180, 360],
      boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)",
      transition: { repeat: Infinity, duration: 2, ease: "linear" }
    },
    recovering: {
      scale: [1, 1.05, 1],
      rotate: [0, 180, 360],
      boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)",
      transition: { repeat: Infinity, duration: 2, ease: "linear" }
    },
    planning: {
      scale: [1, 1.1, 1],
      rotate: [0, 90, 180, 270, 360],
      boxShadow: "0 0 50px rgba(56, 189, 248, 0.8)", // light blue
      transition: { repeat: Infinity, duration: 3, ease: "linear" }
    },
    executing: {
      scale: [1, 1.05, 1],
      rotate: [0, -180, -360],
      boxShadow: "0 0 40px rgba(245, 158, 11, 0.6)", // amber
      transition: { repeat: Infinity, duration: 1.5, ease: "linear" }
    },
    generating_response: {
      scale: [1, 1.2, 1],
      rotate: [0, 360],
      boxShadow: "0 0 60px rgba(236, 72, 153, 0.7)", // pink
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
    },
    speaking: {
      scale: [1.1, 1.3, 1.15, 1.25, 1.1],
      boxShadow: "0 0 80px rgba(99, 102, 241, 1)",
      transition: { repeat: Infinity, duration: 0.3, ease: "easeInOut" }
    },
    error: {
      scale: 1,
      boxShadow: "0 0 30px rgba(239, 68, 68, 0.8)", // red
      transition: { repeat: Infinity, duration: 1, ease: "easeInOut", repeatType: "reverse" as const }
    }
  } as Record<string, any>

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-96 md:h-96">
      {/* Background ripple for listening */}
      {state === "listening" && (
        <motion.div
          className="absolute inset-0 rounded-full border border-primary pointer-events-none"
          animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
        />
      )}

      {/* Core Orb with WebGL Canvas */}
      <motion.div
        animate={variants[state] as any}
        className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
      >
         <canvas ref={canvasRef} className="block w-full h-full" />
      </motion.div>
    </div>
  )
}
