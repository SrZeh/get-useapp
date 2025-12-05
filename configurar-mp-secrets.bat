@echo off
REM Script para configurar secrets do Mercado Pago
REM Execute este script no CMD

echo ========================================
echo Configurando Secrets do Mercado Pago
echo ========================================
echo.

echo Configurando MERCADO_PAGO_ACCESS_TOKEN...
echo Quando solicitado, cole o token:
echo APP_USR-1433516116948338-112814-f46efa9a267377a8aa66540444ff84f7-3023406350
echo.
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN

echo.
echo Configurando MERCADO_PAGO_PUBLIC_KEY...
echo Quando solicitado, cole a public key:
echo APP_USR-568e9753-2580-44bb-bac7-9db2b16ff87a
echo.
firebase functions:secrets:set MERCADO_PAGO_PUBLIC_KEY

echo.
echo ========================================
echo Secrets configurados!
echo ========================================
echo.
echo Proximo passo: Fazer deploy das functions
echo Execute: cd functions ^&^& npm run build ^&^& firebase deploy --only functions

pause



