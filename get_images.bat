@echo off
echo 🐩 Standard Parti Poodles Australia - Image Downloader
echo ==================================================

if not exist "images" mkdir images

echo.
echo 📥 Attempting to download images from your website...
echo.

rem Try to download using PowerShell with Invoke-WebRequest
powershell -Command "try { Invoke-WebRequest -Uri 'https://partipoodlesaustralia.com/images/puppy1.jpg' -OutFile 'images/puppy1.jpg' -UserAgent 'Mozilla/5.0' -ErrorAction Stop; Write-Host '✅ Downloaded puppy1.jpg' -ForegroundColor Green } catch { Write-Host '❌ Could not download puppy1.jpg' -ForegroundColor Red }"

powershell -Command "try { Invoke-WebRequest -Uri 'https://partipoodlesaustralia.com/images/puppy2.jpg' -OutFile 'images/puppy2.jpg' -UserAgent 'Mozilla/5.0' -ErrorAction Stop; Write-Host '✅ Downloaded puppy2.jpg' -ForegroundColor Green } catch { Write-Host '❌ Could not download puppy2.jpg' -ForegroundColor Red }"

powershell -Command "try { Invoke-WebRequest -Uri 'https://partipoodlesaustralia.com/images/puppy3.jpg' -OutFile 'images/puppy3.jpg' -UserAgent 'Mozilla/5.0' -ErrorAction Stop; Write-Host '✅ Downloaded puppy3.jpg' -ForegroundColor Green } catch { Write-Host '❌ Could not download puppy3.jpg' -ForegroundColor Red }"

echo.
echo 💡 If automatic download failed, please:
echo 1. Open https://partipoodlesaustralia.com in your browser
echo 2. Right-click on each puppy image
echo 3. Select "Save image as..."
echo 4. Save to the 'images' folder with these exact names:
echo    - black-white-female-1.jpg
echo    - black-white-female-2.jpg  
echo    - black-white-female-3.jpg
echo    - black-white-female-4.jpg
echo    - brown-white-female.jpg
echo    - black-white-male.jpg
echo.
echo 🚀 Then refresh your beautiful new website to see the results!
echo.
pause
