$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = Join-Path $scriptDir "venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
    Write-Error "Missing backend virtual environment at $python. Recreate it with: py -3.11 -m venv backend\venv"
}

Push-Location $scriptDir
try {
    & $python -m uvicorn main:app --reload
}
finally {
    Pop-Location
}
