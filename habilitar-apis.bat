@echo off
REM Script para habilitar APIs do Google Cloud
REM Requer gcloud CLI instalado e autenticado

echo ========================================
echo Habilitando APIs do Google Cloud
echo ========================================
echo.

set PROJECT_ID=upperreggae

echo Projeto: %PROJECT_ID%
echo.

REM Verificar se gcloud está instalado
where gcloud >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] gcloud CLI nao esta instalado!
    echo.
    echo Para instalar o gcloud CLI:
    echo 1. Baixe de: https://cloud.google.com/sdk/docs/install
    echo 2. Execute o instalador
    echo 3. Execute: gcloud init
    echo 4. Execute: gcloud auth login
    echo.
    echo Ou habilite as APIs manualmente no Console:
    echo https://console.cloud.google.com/apis/library?project=%PROJECT_ID%
    echo.
    pause
    exit /b 1
)

echo [OK] gcloud CLI encontrado
echo.

REM Configurar projeto
echo Configurando projeto...
gcloud config set project %PROJECT_ID%
echo.

REM Habilitar APIs
echo Habilitando pubsub.googleapis.com...
gcloud services enable pubsub.googleapis.com
echo.

echo Habilitando cloudscheduler.googleapis.com...
gcloud services enable cloudscheduler.googleapis.com
echo.

echo Habilitando eventarc.googleapis.com...
gcloud services enable eventarc.googleapis.com
echo.

echo Habilitando run.googleapis.com...
gcloud services enable run.googleapis.com
echo.

echo Habilitando serviceusage.googleapis.com...
gcloud services enable serviceusage.googleapis.com
echo.

echo Habilitando servicemanagement.googleapis.com...
gcloud services enable servicemanagement.googleapis.com
echo.

echo ========================================
echo Concluido!
echo ========================================
echo.
echo Agora voce pode tentar o deploy novamente:
echo firebase deploy --only functions
echo.

pause



