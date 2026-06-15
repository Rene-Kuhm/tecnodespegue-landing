# load-secrets.ps1
# Carga las credenciales desde .env a variables de entorno de la sesion actual
# Soporta multiples API keys de Gemini (GEMINI_API_KEY_1, _2, _3...) para rotacion
#
# Uso: . .\load-secrets.ps1
# O:   & .\load-secrets.ps1

$envDir = $PSScriptRoot
$envFile = Join-Path $envDir ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "No se encontro $envFile" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creando archivo desde template. Edita con tus credenciales:" -ForegroundColor Cyan
    Write-Host ""

    if (-not (Test-Path (Join-Path $envDir ".env.example"))) {
        Write-Host "ERROR: tampoco hay .env.example" -ForegroundColor Red
        exit 1
    }

    Copy-Item (Join-Path $envDir ".env.example") $envFile
    Write-Host "Copiado template a .env. Edita con tus keys REALES:" -ForegroundColor Green
    Write-Host "  notepad $envFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ATENCION: para rotacion de quota, necesitas 3-5 API keys DISTINTAS." -ForegroundColor Yellow
    Write-Host "              Cada una tiene limite de 20 req/dia en free tier." -ForegroundColor Yellow
    Write-Host "              Con 5 keys = 100 req/dia." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Despues corre este script de nuevo." -ForegroundColor Yellow
    exit 0
}

Write-Host "Cargando credenciales desde $envFile..." -ForegroundColor Cyan
Write-Host ""

$loaded = @()
$skipped = @()
$geminiKeys = @()

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()

    if ($line -match '^\s*#' -or $line -match '^\s*$') { return }

    $parts = $line -split '=', 2
    if ($parts.Length -ne 2) { return }

    $name = $parts[0].Trim()
    $value = $parts[1].Trim()

    # Detectar placeholders sin reemplazar
    if ($value -match '\.\.\.' -or $value -eq '') {
        $skipped += $name
        Write-Host "  SKIP $name (placeholder, edita .env)" -ForegroundColor Yellow
        return
    }

    # Setear env var
    Set-Item -Path "Env:$name" -Value $value
    $loaded += $name
    $masked = $value.Substring(0, [Math]::Min(8, $value.Length)) + "..."
    Write-Host "  OK  $name = $masked" -ForegroundColor Green

    # Contar keys de Gemini
    if ($name -match '^GEMINI_API_KEY_\d+$') {
        $geminiKeys += $name
    }
}

Write-Host ""
Write-Host "Cargadas: $($loaded.Count) variable(s)" -ForegroundColor Cyan

if ($geminiKeys.Count -gt 0) {
    Write-Host ""
    Write-Host "API keys de Gemini detectadas: $($geminiKeys.Count)" -ForegroundColor Green
    Write-Host "  (free tier = 20 req/dia POR key, total = $($geminiKeys.Count * 20) req/dia)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Ya podes usar:" -ForegroundColor Green
Write-Host "  - analyze-last-commit.js (Gemini con rotacion automatica)"
Write-Host "  - suggest-commit.js (Gemini con rotacion automatica)"
Write-Host "  - git-obsidian-bridge.js con AGY_AUDIT=1"
