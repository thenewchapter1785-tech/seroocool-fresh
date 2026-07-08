param(
  [Parameter(Mandatory = $true)]
  [string]$Script,

  [string[]]$Arguments
)

$ErrorActionPreference = "Stop"

$nodeDir = "C:\Program Files\nodejs"
$nodeExe = Join-Path $nodeDir "node.exe"

if (-not (Test-Path $nodeExe)) {
  throw "Node executable not found at $nodeExe"
}

$npmCliCandidates = @(
  (Join-Path $nodeDir "node_modules\npm\bin\npm-cli.js"),
  (Join-Path $nodeDir "npm\bin\npm-cli.js")
)

$npmCli = $npmCliCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $npmCli) {
  throw "npm-cli.js not found under $nodeDir"
}

$env:Path = "$nodeDir;$env:Path"

$argList = @($npmCli, "run", $Script)
if ($Arguments) {
  $argList += $Arguments
}

& $nodeExe @argList
exit $LASTEXITCODE
