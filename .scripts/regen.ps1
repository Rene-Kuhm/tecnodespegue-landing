# Regenera Vault Health + Home + estado del vault
# Uso: .\regen.ps1
# Equivale a: node ~/.gemini/antigravity/vault-health.js

$ErrorActionPreference = "Stop"
$VaultPath = "F:\Tecnodespegue"
$Script = "$HOME\.gemini\antigravity\vault-health.js"

Write-Host "[regen] Regenerando Vault Health + Home..." -ForegroundColor Cyan
node $Script $VaultPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "[regen] ERROR: vault-health.js fallo" -ForegroundColor Red
    exit 1
}
Write-Host "[regen] OK - Vault Health.md y Home.md actualizados" -ForegroundColor Green
