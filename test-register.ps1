# Test Register API
# ทดสอบสมัครสมาชิกใหม่

Write-Host "Testing Registration..." -ForegroundColor Cyan

$body = @{
    email = "newuser@example.com"
    password = "test1234"
    name = "New User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/auth/register" -Body $body -ContentType "application/json"
    Write-Host "✓ Registration Success!" -ForegroundColor Green
    Write-Host "User ID: $($response.user.userId)" -ForegroundColor Yellow
    Write-Host "Email: $($response.user.email)" -ForegroundColor Yellow
    Write-Host "Message: $($response.message)" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Registration Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
