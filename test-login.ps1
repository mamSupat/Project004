# Test Login API with AWS DynamoDB User
# ทดสอบ login ด้วย user ที่อยู่ใน AWS

Write-Host "Testing Login with 66030281@kmitl.ac.th..." -ForegroundColor Cyan

$body = @{
    email = "66030281@kmitl.ac.th"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/auth/login" -Body $body -ContentType "application/json"
    Write-Host "✓ Login Success!" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0,50))..." -ForegroundColor Yellow
    Write-Host "User: $($response.user.name) ($($response.user.email))" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Login Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
