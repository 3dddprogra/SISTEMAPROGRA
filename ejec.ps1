# ============================================
# FOODTECH - Generador de Proyecto (PowerShell)
# ============================================

$ProjectDir = "foodtech"

Write-Host "🍽️ Creando estructura del proyecto FOODTECH..." -ForegroundColor Green

# Crear carpetas
$folders = @(
    "$ProjectDir/database",
    "$ProjectDir/backend/src/config",
    "$ProjectDir/backend/src/middleware",
    "$ProjectDir/backend/src/routes/v1",
    "$ProjectDir/backend/src/controllers",
    "$ProjectDir/backend/src/services",
    "$ProjectDir/backend/src/repositories",
    "$ProjectDir/backend/src/sockets",
    "$ProjectDir/backend/src/utils",
    "$ProjectDir/backend/src/types",
    "$ProjectDir/frontend/src/hooks",
    "$ProjectDir/frontend/src/services",
    "$ProjectDir/frontend/src/pages/cliente",
    "$ProjectDir/frontend/src/pages/kds",
    "$ProjectDir/frontend/src/pages/caja",
    "$ProjectDir/frontend/src/components/cliente",
    "$ProjectDir/frontend/src/components/kds",
    "$ProjectDir/frontend/src/components/caja",
    "$ProjectDir/frontend/src/components/common",
    "$ProjectDir/frontend/src/types"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

Write-Host "✅ Estructura de carpetas creada" -ForegroundColor Green

# ... (continuar creando archivos con Set-Content)

# Crear ZIP
Write-Host "📦 Creando foodtech.zip..." -ForegroundColor Yellow
Compress-Archive -Path "$ProjectDir\*" -DestinationPath "foodtech.zip" -Force
Write-Host "✅ foodtech.zip creado exitosamente" -ForegroundColor Green
Get-Item foodtech.zip | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}