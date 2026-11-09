Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting EduPortal Classroom Management System" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

Write-Host "1. Launching Backend Express Server on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "2. Launching Frontend React App on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  Both servers launched successfully!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

