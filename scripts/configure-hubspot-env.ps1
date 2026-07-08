param(
  [string]$AppId = "a7fabd80-117e-4683-8ca7-2636b2a48c93",
  [string]$Domain = "zerocool-development.com",
  [string]$RepoCloneUrl = "https://github.com/thenewchapter1785-tech/seroocool-fresh.git",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

function Read-RequiredPlainText {
  param(
    [string]$Prompt,
    [switch]$Secret
  )

  while ($true) {
    if ($Secret) {
      $secureValue = Read-Host -Prompt $Prompt -AsSecureString
      $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
      try {
        $value = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
      }
      finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
      }
    }
    else {
      $value = Read-Host -Prompt $Prompt
    }

    if (-not [string]::IsNullOrWhiteSpace($value)) {
      return $value.Trim()
    }

    Write-Host "Value is required. Please try again." -ForegroundColor Yellow
  }
}

function Add-EnvBlock {
  param(
    [System.Collections.Generic.List[string]]$Lines,
    [string]$Key,
    [string]$Value
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return
  }

  $escapedValue = $Value.Replace('"', '\"')
  $Lines.Add("  - key: $Key")
  $Lines.Add("    scope: RUN_AND_BUILD_TIME")
  $Lines.Add("    value: `"$escapedValue`"")
}

Write-Host "Configure HubSpot + lead env vars for DigitalOcean App Platform" -ForegroundColor Cyan
Write-Host "App ID: $AppId" -ForegroundColor DarkGray
Write-Host "Domain: $Domain" -ForegroundColor DarkGray

$hubspotPortalId = Read-RequiredPlainText -Prompt "NEXT_PUBLIC_HUBSPOT_PORTAL_ID"
$hubspotAccessToken = Read-RequiredPlainText -Prompt "HUBSPOT_ACCESS_TOKEN" -Secret
$resendApiKey = Read-RequiredPlainText -Prompt "RESEND_API_KEY" -Secret

$facebookPageUrl = Read-Host "NEXT_PUBLIC_FACEBOOK_PAGE_URL (optional)"
$instagramProfileUrl = Read-Host "NEXT_PUBLIC_INSTAGRAM_PROFILE_URL (optional)"
$metaPixelId = Read-Host "NEXT_PUBLIC_META_PIXEL_ID (optional)"
$facebookDomainVerification = Read-Host "FACEBOOK_DOMAIN_VERIFICATION (optional)"

$leadToEmail = Read-Host "LEAD_TO_EMAIL [thenewchapter1785@gmail.com]"
if ([string]::IsNullOrWhiteSpace($leadToEmail)) {
  $leadToEmail = "thenewchapter1785@gmail.com"
}

$leadFromEmail = Read-Host "LEAD_FROM_EMAIL [onboarding@resend.dev]"
if ([string]::IsNullOrWhiteSpace($leadFromEmail)) {
  $leadFromEmail = "onboarding@resend.dev"
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("name: seroocool")
$lines.Add("region: nyc")
$lines.Add("domains:")
$lines.Add("- domain: $Domain")
$lines.Add("  type: PRIMARY")
$lines.Add("- domain: www.$Domain")
$lines.Add("  type: ALIAS")
$lines.Add("ingress:")
$lines.Add("  rules:")
$lines.Add("  - component:")
$lines.Add("      name: web")
$lines.Add("    match:")
$lines.Add("      path:")
$lines.Add("        prefix: /")
$lines.Add("services:")
$lines.Add("- name: web")
$lines.Add("  git:")
$lines.Add("    branch: $Branch")
$lines.Add("    repo_clone_url: $RepoCloneUrl")
$lines.Add("  run_command: npm run start")
$lines.Add("  source_dir: .")
$lines.Add("  http_port: 3000")
$lines.Add("  instance_count: 1")
$lines.Add("  instance_size_slug: basic-xs")
$lines.Add("  envs:")

Add-EnvBlock -Lines $lines -Key "NODE_ENV" -Value "production"
Add-EnvBlock -Lines $lines -Key "NEXT_PUBLIC_SITE_URL" -Value "https://$Domain"
Add-EnvBlock -Lines $lines -Key "NEXT_PUBLIC_FACEBOOK_PAGE_URL" -Value $facebookPageUrl
Add-EnvBlock -Lines $lines -Key "NEXT_PUBLIC_INSTAGRAM_PROFILE_URL" -Value $instagramProfileUrl
Add-EnvBlock -Lines $lines -Key "NEXT_PUBLIC_META_PIXEL_ID" -Value $metaPixelId
Add-EnvBlock -Lines $lines -Key "FACEBOOK_DOMAIN_VERIFICATION" -Value $facebookDomainVerification
Add-EnvBlock -Lines $lines -Key "RESEND_API_KEY" -Value $resendApiKey
Add-EnvBlock -Lines $lines -Key "LEAD_TO_EMAIL" -Value $leadToEmail
Add-EnvBlock -Lines $lines -Key "LEAD_FROM_EMAIL" -Value $leadFromEmail
Add-EnvBlock -Lines $lines -Key "HUBSPOT_ACCESS_TOKEN" -Value $hubspotAccessToken
Add-EnvBlock -Lines $lines -Key "NEXT_PUBLIC_HUBSPOT_PORTAL_ID" -Value $hubspotPortalId

$specYaml = ($lines -join "`n")

Write-Host "Validating app spec schema..." -ForegroundColor Cyan
$specYaml | doctl apps spec validate - --schema-only | Out-Null

Write-Host "Updating app with HubSpot env vars..." -ForegroundColor Cyan
$specYaml | doctl apps update $AppId --spec - --wait --format ID,DefaultIngress,Updated | Out-Host

Write-Host "Done. Next: submit one test lead from https://$Domain and verify contact appears in HubSpot." -ForegroundColor Green
