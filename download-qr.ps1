$url = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://your-domain.com/mbti"
$output = "public/images/qrcode.png"
Invoke-WebRequest -Uri $url -OutFile $output
Write-Host "QR code downloaded to $output"
