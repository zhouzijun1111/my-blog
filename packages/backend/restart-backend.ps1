$process = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) {
  Stop-Process -Id $process -Force
  Start-Sleep -Seconds 2
}
cd e:/testing/packages/backend
npx tsx src/index.ts
