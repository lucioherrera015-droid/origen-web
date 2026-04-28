# Script de extracción de frames para ORIGEN
# Requiere FFmpeg instalado y en el PATH
# Ejecutar desde la raíz del proyecto: .\extract_frames.ps1

param(
    [string]$VideoFile = "kling_20260428_VIDEO_Smooth_cin_1574_0.mp4",
    [int]$TargetFrames = 150,
    [int]$MaxWidth = 1280,
    [int]$Quality = 82,
    [string]$OutputDir = "frames"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor DarkYellow
Write-Host "  ║   ORIGEN — Extracción de frames      ║" -ForegroundColor DarkYellow
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor DarkYellow
Write-Host ""

# ── Verificar FFmpeg ─────────────────────────────
$ffmpegPath  = (Get-Command ffmpeg  -ErrorAction SilentlyContinue)?.Source
$ffprobePath = (Get-Command ffprobe -ErrorAction SilentlyContinue)?.Source

if (-not $ffmpegPath) {
    Write-Host "  ✗ FFmpeg no encontrado en el PATH." -ForegroundColor Red
    Write-Host "    Instalalo con: winget install --id Gyan.FFmpeg" -ForegroundColor Gray
    exit 1
}
Write-Host "  ✓ FFmpeg: $ffmpegPath" -ForegroundColor Green

# ── Verificar video ──────────────────────────────
if (-not (Test-Path $VideoFile)) {
    Write-Host "  ✗ Video no encontrado: $VideoFile" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Video: $VideoFile" -ForegroundColor Green

# ── Obtener duración ─────────────────────────────
Write-Host ""
Write-Host "  → Leyendo metadatos del video..." -ForegroundColor Cyan

$durationStr = & ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$VideoFile" 2>&1
$duration = [double]$durationStr

if ($duration -le 0) {
    Write-Host "  ✗ No se pudo leer la duración. Verificá el archivo." -ForegroundColor Red
    exit 1
}

$durationFormatted = [math]::Round($duration, 2)
Write-Host "  ✓ Duración: $durationFormatted segundos" -ForegroundColor Green

# ── Calcular FPS para exactamente $TargetFrames frames ──
# fps = TargetFrames / duration  →  extrae ese ritmo de frames
$fps = [math]::Round($TargetFrames / $duration, 6)
Write-Host "  ✓ FPS de extracción: $fps (para $TargetFrames frames)" -ForegroundColor Green

# ── Crear carpeta de salida ──────────────────────
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}
Write-Host "  ✓ Carpeta de salida: .\$OutputDir\" -ForegroundColor Green
Write-Host ""

# ── Extracción ───────────────────────────────────
Write-Host "  → Extrayendo $TargetFrames frames a WebP (ancho max $MaxWidth px, calidad $Quality)..." -ForegroundColor Cyan
Write-Host "     Esto puede tardar 1-3 minutos..." -ForegroundColor Gray
Write-Host ""

$outputPattern = Join-Path $OutputDir "frame_%03d.webp"

$ffmpegArgs = @(
    "-i", $VideoFile,
    "-vf", "fps=$fps,scale=${MaxWidth}:-2",
    "-c:v", "libwebp",
    "-quality", "$Quality",
    "-y",
    $outputPattern
)

$startTime = Get-Date
$proc = Start-Process -FilePath "ffmpeg" -ArgumentList $ffmpegArgs -Wait -PassThru -NoNewWindow
$elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)

if ($proc.ExitCode -ne 0) {
    Write-Host "  ✗ FFmpeg terminó con error (código $($proc.ExitCode))." -ForegroundColor Red
    exit 1
}

# ── Verificar resultado ──────────────────────────
$generatedFrames = (Get-ChildItem -Path $OutputDir -Filter "*.webp").Count
$totalSizeMB     = [math]::Round((Get-ChildItem -Path $OutputDir -Filter "*.webp" | Measure-Object -Property Length -Sum).Sum / 1MB, 2)

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║   ✓ Extracción completada            ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Frames generados : $generatedFrames" -ForegroundColor White
Write-Host "  Tamaño total     : $totalSizeMB MB" -ForegroundColor White
Write-Host "  Tiempo           : $elapsed segundos" -ForegroundColor White
Write-Host ""
Write-Host "  Listo. Abrí index.html en el navegador." -ForegroundColor DarkYellow
Write-Host ""
