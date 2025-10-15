# reinstalar_rust.ps1
Write-Host "Limpiando instalaciones previas de Rust..."

Remove-Item -Recurse -Force "$env:USERPROFILE\.rustup" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:USERPROFILE\.cargo" -ErrorAction SilentlyContinue

Write-Host "Directorios antiguos eliminados."

Start-Sleep -Seconds 2

Write-Host "Descargando instalador de Rust..."
Invoke-WebRequest https://win.rustup.rs/x86_64 -OutFile "$env:TEMP\rustup-init.exe"

Write-Host "Instalando Rust (esto puede tardar un poco)..."
Start-Process "$env:TEMP\rustup-init.exe" -ArgumentList "-y", "--default-toolchain", "stable-x86_64-pc-windows-msvc" -Wait -Verb RunAs

Write-Host "Agregando Rust al PATH..."
$env:PATH += ";$env:USERPROFILE\.cargo\bin"

Write-Host "Verificando instalación..."
cargo --version
rustc --version

Write-Host ""
Write-Host "Instalación completada correctamente."
Write-Host "Si algo falla, ejecuta este script nuevamente como Administrador."

Pause
