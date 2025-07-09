# PowerShell script to download images from Standard Parti Poodles Australia website
# Since you own the images, this will help automate the process

Write-Host "🐩 Standard Parti Poodles Australia - Image Downloader" -ForegroundColor Cyan
Write-Host "=" * 50

# Create images directory if it doesn't exist
$imagesDir = "images"
if (!(Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir | Out-Null
    Write-Host "📁 Created images directory" -ForegroundColor Green
}

# Function to download image
function Download-Image {
    param(
        [string]$Url,
        [string]$FilePath
    )
    
    try {
        $webClient = New-Object System.Net.WebClient
        $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        $webClient.DownloadFile($Url, $FilePath)
        Write-Host "✅ Downloaded: $(Split-Path $FilePath -Leaf)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Failed to download $(Split-Path $FilePath -Leaf): $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    finally {
        if ($webClient) { $webClient.Dispose() }
    }
}

# Common image URLs patterns to try
$baseUrl = "https://partipoodlesaustralia.com"
$imageUrls = @()

Write-Host "🔍 Attempting to download images..." -ForegroundColor Yellow

# Try some common image paths
$commonPaths = @(
    "/images/puppy1.jpg",
    "/images/puppy2.jpg", 
    "/images/puppy3.jpg",
    "/images/puppy4.jpg",
    "/images/puppy5.jpg",
    "/images/puppy6.jpg",
    "/uploads/puppy1.jpg",
    "/uploads/puppy2.jpg",
    "/uploads/puppy3.jpg",
    "/uploads/puppy4.jpg",
    "/uploads/puppy5.jpg",
    "/uploads/puppy6.jpg",
    "/assets/puppy1.jpg",
    "/assets/puppy2.jpg",
    "/assets/puppy3.jpg",
    "/assets/puppy4.jpg",
    "/assets/puppy5.jpg",
    "/assets/puppy6.jpg",
    "/wp-content/uploads/puppy1.jpg",
    "/wp-content/uploads/puppy2.jpg",
    "/wp-content/uploads/puppy3.jpg",
    "/wp-content/uploads/puppy4.jpg",
    "/wp-content/uploads/puppy5.jpg",
    "/wp-content/uploads/puppy6.jpg"
)

$downloadCount = 0
foreach ($path in $commonPaths) {
    $url = $baseUrl + $path
    $filename = "puppy_$($downloadCount + 1).jpg"
    $filepath = Join-Path $imagesDir $filename
    
    if (Download-Image -Url $url -FilePath $filepath) {
        $downloadCount++
    }
    
    # Small delay to be respectful
    Start-Sleep -Milliseconds 500
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "Downloaded $downloadCount images to the images folder" -ForegroundColor White

if ($downloadCount -eq 0) {
    Write-Host "`n💡 Alternative approach:" -ForegroundColor Yellow
    Write-Host "If no images were found automatically, you can:" -ForegroundColor White
    Write-Host "1. Open https://partipoodlesaustralia.com in your browser" -ForegroundColor White
    Write-Host "2. Right-click on each puppy image" -ForegroundColor White
    Write-Host "3. Select 'Save image as...'" -ForegroundColor White
    Write-Host "4. Save to the 'images' folder with these names:" -ForegroundColor White
    Write-Host "   - black-white-female-1.jpg" -ForegroundColor Gray
    Write-Host "   - black-white-female-2.jpg" -ForegroundColor Gray
    Write-Host "   - black-white-female-3.jpg" -ForegroundColor Gray
    Write-Host "   - black-white-female-4.jpg" -ForegroundColor Gray
    Write-Host "   - brown-white-female.jpg" -ForegroundColor Gray
    Write-Host "   - black-white-male.jpg" -ForegroundColor Gray
    
    Write-Host "`n🚀 Then open your new website to see the beautiful results!" -ForegroundColor Green
} else {
    Write-Host "`n🎉 Success! Now rename the downloaded images to match your website structure:" -ForegroundColor Green
    Write-Host "The download_images.html file has the complete naming guide." -ForegroundColor White
}

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
