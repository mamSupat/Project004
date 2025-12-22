# Kill existing node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start backend
Set-Location backend
npm run dev
