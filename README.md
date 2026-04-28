# ORIGEN — Café de Especialidad

Landing page para **ORIGEN**, marca ficticia de café de especialidad tostado a mano en Buenos Aires.

## ✨ Features

- **Scroll-driven animation**: El video avanza fotograma a fotograma al scrollear, usando `<canvas>` fijo + GSAP ScrollTrigger
- **Smooth scroll**: Lenis integrado con el ticker de GSAP
- **Dark luxury aesthetic**: Fondo negro, tipografía Cormorant Garamond, acentos en ámbar dorado (#c8a45a)
- **Scroll reveal**: Fade-in + slide-up de secciones con IntersectionObserver
- **Responsive**: Mobile-first, hamburger menu en mobile
- **Vercel-ready**: Estático puro, sin dependencias de build

## 🗂 Estructura

```
origen-web/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js              # Lenis + nav + hamburger
│   ├── scroll-animation.js  # Canvas + GSAP + precarga de frames
│   └── animations.js        # IntersectionObserver reveal
├── frames/
│   └── frame_001.webp … frame_150.webp   # 150 frames WebP (5.5 MB)
├── vercel.json              # Cache headers para frames
└── extract_frames.ps1       # Script para regenerar frames con FFmpeg
```

## 🚀 Deploy

Deployado automáticamente en **Vercel** al hacer push a `main`.  
No requiere build step — HTML estático servido directamente.

## 🔧 Regenerar frames

Si cambiás el video, ejecutá:

```powershell
# Requiere FFmpeg instalado (winget install --id Gyan.FFmpeg)
powershell -ExecutionPolicy Bypass -File .\extract_frames.ps1
```

## 🎨 Stack

| Rol | Tecnología |
|---|---|
| Scroll animation | GSAP 3 + ScrollTrigger |
| Smooth scroll | Lenis 1.0 |
| Tipografía | Cormorant Garamond + Outfit (Google Fonts) |
| Deploy | Vercel (estático) |
| Frames | FFmpeg → WebP 1280px, calidad 82 |

## 📍 Secciones

1. **Hero** — Canvas full-screen con scroll-driven video (150 frames)
2. **Cada taza tiene historia** — Texto de marca + estadísticas
3. **Encontrá tu blend** — Cards: Volcánico · Serranía · Nocturno
4. **CTA** — "Tu próximo café no debería ser cualquiera"
