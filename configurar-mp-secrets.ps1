# Script para configurar secrets do Mercado Pago
# Execute este script no PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configurando Secrets do Mercado Pago" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Access Token
Write-Host "Configurando MERCADO_PAGO_ACCESS_TOKEN..." -ForegroundColor Yellow
Write-Host "Quando solicitado, cole o token:" -ForegroundColor Gray
Write-Host "APP_USR-1433516116948338-112814-f46efa9a267377a8aa66540444ff84f7-3023406350" -ForegroundColor Green
Write-Host ""
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN

Write-Host ""
Write-Host "Configurando MERCADO_PAGO_PUBLIC_KEY..." -ForegroundColor Yellow
Write-Host "Quando solicitado, cole a public key:" -ForegroundColor Gray
Write-Host "APP_USR-568e9753-2580-44bb-bac7-9db2b16ff87a" -ForegroundColor Green
Write-Host ""
firebase functions:secrets:set MERCADO_PAGO_PUBLIC_KEY

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Secrets configurados!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximo passo: Fazer deploy das functions" -ForegroundColor Yellow
Write-Host "Execute: cd functions && npm run build && firebase deploy --only functions" -ForegroundColor Gray

