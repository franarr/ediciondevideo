@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  CABANA ^& ARELLANO - Subir videos nuevos
echo  ----------------------------------------
echo  1. Copia los videos a la carpeta media-src\videos
echo  2. (Opcional) portadas en media-src\covers y capturas en media-src\testimonials
echo.
if not exist "media-src\videos" mkdir "media-src\videos"
start "" "media-src\videos"
pause
node scripts\nuevo-video.mjs
echo.
pause
