$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputDir = Join-Path $projectRoot "out"

if (-not (Get-Command javac -ErrorAction SilentlyContinue)) {
    throw "Java Development Kit (JDK) 17 or newer is required."
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
javac -encoding UTF-8 -d $outputDir (Join-Path $projectRoot "src\PeopleFlowServer.java")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "PeopleFlow HR is running at http://localhost:8080"
java -cp $outputDir PeopleFlowServer
