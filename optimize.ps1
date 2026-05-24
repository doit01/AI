Write-Host "=== Windows 开机速度优化脚本 ===" -ForegroundColor Cyan
Write-Host "以管理员身份运行..." -ForegroundColor Yellow

# 1. 禁用休眠，释放 hiberfil.sys（可回收几GB空间+加快关机/启动）
Write-Host "`n[1/6] 禁用休眠..." -ForegroundColor Green
powercfg /hibernate off
Write-Host "  完成"

# 2. 通过注册表禁用开机启动项
Write-Host "`n[2/6] 禁用无用开机启动项..." -ForegroundColor Green
$removeRunKeys = @(
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; Name="RtkAudUService"}
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; Name="Logi Download Assistant"}
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; Name="SecurityHealth"}
)
foreach ($item in $removeRunKeys) {
    Remove-ItemProperty -Path $item.Path -Name $item.Name -ErrorAction SilentlyContinue
}

# 3. 禁用不必要的系统服务
Write-Host "`n[3/6] 禁用拖慢启动的服务..." -ForegroundColor Green
$servicesToDisable = @(
    @{Name="SysMain"; Display="Superfetch (SSD 上不需要)"}
    @{Name="DiagTrack"; Display="连接用户体验和遥测"}
    @{Name="WSearch"; Display="Windows 搜索索引（若不用搜索可关）"}
    @{Name="PcaSvc"; Display="程序兼容性助手"}
    @{Name="SmartByte Analytics Service"; Display="SmartByte 分析"}
    @{Name="SmartByte Network Service x64"; Display="SmartByte 网络"}
    @{Name="Dell Digital Delivery Services"; Display="Dell 数字配送"}
    @{Name="Dell SupportAssist Remediation"; Display="Dell SupportAssist"}
    @{Name="DellTechHub"; Display="Dell TechHub"}
    @{Name="SupportAssistAgent"; Display="Dell SupportAssist Agent"}
    @{Name="AMD Crash Defender Service"; Display="AMD Crash Defender"}
    @{Name="QQGameService"; Display="QQ 游戏服务"}
    @{Name="XLServicePlatform"; Display="迅雷下载服务"}
    @{Name="OfficePLUS Service"; Display="OfficePLUS"}
    @{Name="MuseAuthService"; Display="Muse 认证"}
    @{Name="RAPSService"; Display="Rivet AP 选择器"}
    @{Name="PCManager Service Store"; Display="微软电脑管家"}
)

foreach ($svc in $servicesToDisable) {
    $s = Get-Service -Name $svc.Name -ErrorAction SilentlyContinue
    if ($s) {
        Write-Host "  禁用: $($svc.Display) ($($svc.Name))"
        Set-Service -Name $svc.Name -StartupType Disabled -ErrorAction SilentlyContinue
        Stop-Service -Name $svc.Name -Force -ErrorAction SilentlyContinue
    }
}

# 4. 将部分服务改为手动启动（需要时自启）
Write-Host "`n[4/6] 将部分服务设为手动..." -ForegroundColor Green
$servicesToManual = @(
    "ClickToRunSvc"          # Office
    "Wlansvc"                # WiFi
    "Spooler"                # 打印机
    "FontCache"              # 字体缓存
    "WpnService"             # 通知
)
foreach ($svc in $servicesToManual) {
    $s = Get-Service -Name $svc -ErrorAction SilentlyContinue
    if ($s) {
        Write-Host "  设置手动: $svc"
        Set-Service -Name $svc -StartupType Manual -ErrorAction SilentlyContinue
    }
}

# 5. 清理系统垃圾
Write-Host "`n[5/6] 清理系统垃圾..." -ForegroundColor Green
# 清理 Windows 临时文件
Remove-Item "$env:WINDIR\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
# 清理 WinSxS 备份
DISM.exe /Online /Cleanup-Image /StartComponentCleanup /ResetBase
# 磁盘清理
cleanmgr /sagerun:1 | Out-Null
Write-Host "  完成"

# 6. 优化页面文件（统一管理）
Write-Host "`n[6/6] 完成！" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "优化完成！建议重启电脑使更改生效。" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
pause
