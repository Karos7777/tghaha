@echo off
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe /T
echo.

echo Installing dependencies...
npm install
echo.

echo Starting server...
start cmd /k "node server.js"
echo.

echo Starting bot...
start cmd /k "node bot.js"
echo.

echo Server and bot have been started!
echo.
echo Remember to update your .env file with the correct BOT_TOKEN and WEBAPP_URL
echo.
pause
