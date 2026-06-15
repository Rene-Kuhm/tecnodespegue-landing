# write-utf8.ps1
# Helper que escribe texto a archivo en UTF-8 SIN BOM
# Uso: .\write-utf8.ps1 -Path "C:\ruta\archivo.txt" -Content "texto sin BOM"

param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Content
)

# UTF8 sin BOM = UTF8Encoding con emitBOM = false
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
Write-Host ("Escrito: " + $Path + " (" + (Get-Item $Path).Length + " bytes, UTF-8 sin BOM)")
