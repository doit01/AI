Remove-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "BaiduYunDetect" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "Docker Desktop" -ErrorAction SilentlyContinue
# Disable Teams via machine policy
New-Item -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer\DisallowRun" -Force -ErrorAction SilentlyContinue | Out-Null
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer\DisallowRun" -Name "1" -Value "com.squirrel.Teams.Teams.exe" -Type String -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" -Name "DisallowRun" -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
# Disable Teams task
schtasks /change /tn "com.squirrel.Teams.Teams" /disable 2>$null
schtasks /change /tn "MicrosoftTeams*" /disable 2>$null
Write-Host "Done"
