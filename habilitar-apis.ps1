# Script para habilitar APIs do Google Cloud necessárias para Firebase Functions
# Requer autenticação do gcloud ou token de acesso

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Habilitando APIs do Google Cloud" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ID = "upperreggae"
$APIS = @(
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
    "eventarc.googleapis.com",
    "run.googleapis.com",
    "serviceusage.googleapis.com",
    "servicemanagement.googleapis.com"
)

Write-Host "Projeto: $PROJECT_ID" -ForegroundColor Yellow
Write-Host ""

# Verificar se gcloud está instalado
$gcloudPath = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloudPath) {
    Write-Host "❌ gcloud CLI não está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar o gcloud CLI:" -ForegroundColor Yellow
    Write-Host "1. Baixe de: https://cloud.google.com/sdk/docs/install" -ForegroundColor Gray
    Write-Host "2. Execute o instalador" -ForegroundColor Gray
    Write-Host "3. Execute: gcloud init" -ForegroundColor Gray
    Write-Host "4. Execute: gcloud auth login" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ou habilite as APIs manualmente no Console:" -ForegroundColor Yellow
    Write-Host "https://console.cloud.google.com/apis/library?project=$PROJECT_ID" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✅ gcloud CLI encontrado" -ForegroundColor Green
Write-Host ""

# Verificar se está autenticado
Write-Host "Verificando autenticação..." -ForegroundColor Yellow
$authCheck = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1
if (-not $authCheck -or $authCheck -match "ERROR") {
    Write-Host "❌ Não autenticado no gcloud!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Execute: gcloud auth login" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Autenticado como: $authCheck" -ForegroundColor Green
Write-Host ""

# Configurar projeto
Write-Host "Configurando projeto..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID
Write-Host ""

# Habilitar cada API
foreach ($api in $APIS) {
    Write-Host "Habilitando $api..." -ForegroundColor Yellow
    $result = gcloud services enable $api 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $api habilitada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erro ao habilitar $api" -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Concluído!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora você pode tentar o deploy novamente:" -ForegroundColor Yellow
Write-Host "firebase deploy --only functions" -ForegroundColor Gray
Write-Host ""

