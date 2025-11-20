@echo off
setlocal
cd BackEnd
REM 检查是否带 -i 参数（忽略大小写）
if /i "%~1"=="-i" (
    echo Creating virtual environment...
    python -m venv .venv

    echo Activating virtual environment...
    call .\.venv\Scripts\activate

    echo installing flask and webauthn...
    pip install flask webauthn
) else (
    REM 确认激活虚拟环境，不安装依赖
    if exist ".venv\Scripts\activate" (
        call .\.venv\Scripts\activate
    ) else (
        echo Cannot find virtual environment. Initialize with "runBackEnd.bat -i"
        pause
        exit /b 1
    )
)

echo running flask app...
flask run

endlocal
pause
