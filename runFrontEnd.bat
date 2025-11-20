@echo off
cd FrontEnd
REM 检查第一个参数是否为 -i
if "%1"=="-i" (
    echo installing modules...
    npm install
)

echo running frontend...
npm run dev

REM 暂停，防止窗口直接关闭（可选）
pause
