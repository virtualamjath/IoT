@rem ----[ This code block detects if the script is being running with admin PRIVILEGES If it isn't it pauses and then quits]-------
echo OFF
NET SESSION >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    ECHO Administrator PRIVILEGES Detected! 
) ELSE (
   echo.
   echo ####### ERROR: ADMINISTRATOR PRIVILEGES REQUIRED #########
   echo This script must be run as administrator to work properly!  
   echo If you're seeing this after clicking on a desktop icon,
   echo then right click on the desktop icon and select "Run As Administrator".
   echo ##########################################################
   echo.
   PAUSE
   EXIT /B 1
)

@echo on
Title Starting IoT SDK

:: Navigate to Path

cd "%USERPROFILE%\Desktop\EdgeToCloud\"


"C:\Program Files\nodejs\node.exe" CreateDeviceIdentity.js
