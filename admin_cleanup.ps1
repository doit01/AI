# Disable remaining services
$svcs = "DiagTrack","PcaSvc","WSearch","Dell Digital Delivery Services","Dell SupportAssist Remediation","DellTechHub","SupportAssistAgent","AMD Crash Defender Service","QQGameService","XLServicePlatform","OfficePLUS Service","MuseAuthService","RAPSService","SmartByte Analytics Service","SmartByte Network Service x64","PCManager Service Store"
foreach ($s in $svcs) {
    $svc = Get-Service -Name $s -ErrorAction SilentlyContinue
    if ($svc) { Set-Service -Name $s -StartupType Disabled; Stop-Service -Name $s -Force }
}

# Clean WinSxS
DISM /Online /Cleanup-Image /StartComponentCleanup /ResetBase

# Clean system temp
Remove-Item "$env:WINDIR\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:WINDIR\SoftwareDistribution\Download\*" -Recurse -Force -ErrorAction SilentlyContinue
cleanmgr /sagerun:1

Write-Host "Done"
