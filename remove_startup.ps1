$startupRemove = @(
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; Name="BaiduYunDetect"}
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; Name="Docker Desktop"}
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; Name="Logi Download Assistant"}
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; Name="apmwinapp"}
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; Name="podman-desktop"}
)

foreach ($item in $startupRemove) {
    Remove-ItemProperty -Path $item.Path -Name $item.Name -ErrorAction SilentlyContinue
}

# Disable Teams auto-start via machine-wide policy
New-Item -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" -Name "DisallowRun" -Force | Out-Null
New-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer\DisallowRun" -Name "1" -Value "com.squirrel.Teams.Teams.exe" -PropertyType String -Force | Out-Null
New-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" -Name "DisallowRun" -Value 1 -PropertyType DWord -Force | Out-Null

# Disable Edge pre-launch
New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Microsoft Edge\PreventLaunchAtStartup" -Force | Out-Null
New-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Microsoft Edge" -Name "PreventLaunchAtStartup" -Value 1 -PropertyType DWord -Force | Out-Null

Write-Host "Done clearing HKLM startup items"
