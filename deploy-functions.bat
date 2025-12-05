@echo off
echo ========================================
echo Deploy das Functions Modificadas
echo ========================================
echo.

echo [1/11] Deploying onReservationCreated...
firebase deploy --only functions:onReservationCreated
if %errorlevel% neq 0 (
    echo ERRO no deploy de onReservationCreated
    pause
    exit /b 1
)
echo ✓ onReservationCreated deployado com sucesso!
echo.

echo [2/11] Deploying onMessageCreated...
firebase deploy --only functions:onMessageCreated
if %errorlevel% neq 0 (
    echo ERRO no deploy de onMessageCreated
    pause
    exit /b 1
)
echo ✓ onMessageCreated deployado com sucesso!
echo.

echo [3/11] Deploying acceptReservation...
firebase deploy --only functions:acceptReservation
if %errorlevel% neq 0 (
    echo ERRO no deploy de acceptReservation
    pause
    exit /b 1
)
echo ✓ acceptReservation deployado com sucesso!
echo.

echo [4/11] Deploying rejectReservation...
firebase deploy --only functions:rejectReservation
if %errorlevel% neq 0 (
    echo ERRO no deploy de rejectReservation
    pause
    exit /b 1
)
echo ✓ rejectReservation deployado com sucesso!
echo.

echo [5/11] Deploying cancelAcceptedReservation...
firebase deploy --only functions:cancelAcceptedReservation
if %errorlevel% neq 0 (
    echo ERRO no deploy de cancelAcceptedReservation
    pause
    exit /b 1
)
echo ✓ cancelAcceptedReservation deployado com sucesso!
echo.

echo [6/11] Deploying cancelWithRefund...
firebase deploy --only functions:cancelWithRefund
if %errorlevel% neq 0 (
    echo ERRO no deploy de cancelWithRefund
    pause
    exit /b 1
)
echo ✓ cancelWithRefund deployado com sucesso!
echo.

echo [7/11] Deploying releasePayoutToOwner...
firebase deploy --only functions:releasePayoutToOwner
if %errorlevel% neq 0 (
    echo ERRO no deploy de releasePayoutToOwner
    pause
    exit /b 1
)
echo ✓ releasePayoutToOwner deployado com sucesso!
echo.

echo [8/11] Deploying markPickup...
firebase deploy --only functions:markPickup
if %errorlevel% neq 0 (
    echo ERRO no deploy de markPickup
    pause
    exit /b 1
)
echo ✓ markPickup deployado com sucesso!
echo.

echo [9/11] Deploying confirmReturn...
firebase deploy --only functions:confirmReturn
if %errorlevel% neq 0 (
    echo ERRO no deploy de confirmReturn
    pause
    exit /b 1
)
echo ✓ confirmReturn deployado com sucesso!
echo.

echo [10/11] Deploying confirmCheckoutSession...
firebase deploy --only functions:confirmCheckoutSession
if %errorlevel% neq 0 (
    echo ERRO no deploy de confirmCheckoutSession
    pause
    exit /b 1
)
echo ✓ confirmCheckoutSession deployado com sucesso!
echo.

echo [11/11] Deploying stripeWebhook...
firebase deploy --only functions:stripeWebhook
if %errorlevel% neq 0 (
    echo ERRO no deploy de stripeWebhook
    pause
    exit /b 1
)
echo ✓ stripeWebhook deployado com sucesso!
echo.

echo ========================================
echo TODAS AS FUNCTIONS FORAM DEPLOYADAS!
echo ========================================
pause




