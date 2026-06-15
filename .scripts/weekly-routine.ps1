#!/usr/bin/env pwsh
# Rutina semanal de mantenimiento del vault
# Uso: powershell -File weekly-routine.ps1
# Que hace:
#   1. Regenera Vault Health + Home
#   2. Lista notas vencidas para revision
#   3. Muestra resumen
#   4. Ofrece commitear los cambios

$ErrorActionPreference = "Stop"
$VaultPath = "F:\Tecnodespegue"
$BridgeDir = "$HOME\.gemini\antigravity"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RUTINA SEMANAL DE MANTENIMIENTO" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Regenerar Vault Health
Write-Host "[1/4] Regenerando Vault Health y Home..." -ForegroundColor Yellow
node "$BridgeDir\vault-health.js" $VaultPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: vault-health.js fallo" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Ver notas vencidas
Write-Host "[2/4] Notas vencidas para revision..." -ForegroundColor Yellow
node "$BridgeDir\review-due.js" $VaultPath
Write-Host ""

# 3. Estado de git
Write-Host "[3/4] Estado de git..." -ForegroundColor Yellow
$gitStatus = git -C $VaultPath status --short 2>&1
if ($gitStatus) {
    Write-Host "Cambios sin commitear:" -ForegroundColor Magenta
    Write-Host $gitStatus
} else {
    Write-Host "Working tree limpio" -ForegroundColor Green
}
Write-Host ""

# 4. Ofrecer commit
Write-Host "[4/4] Listo para commitear?" -ForegroundColor Yellow
$response = Read-Host "Commitea los cambios de Vault Health/Home? (s/n)"
if ($response -eq "s") {
    git -C $VaultPath add -A
    git -C $VaultPath commit -m "chore(routine): regenerar vault health $(Get-Date -Format 'yyyy-MM-dd')"
    Write-Host ""
    Write-Host "OK - Commit hecho." -ForegroundColor Green
} else {
    Write-Host "OK - Sin commit. Los cambios estan en working tree." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RUTINA COMPLETADA" -ForegroundColor Cyan
Write-Host "  Proximo paso manual: revisar inbox" -ForegroundColor Cyan
Write-Host "  Archivo: 20-Areas/Rutinas/Revision Semanal.md" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
