$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($PSScriptRoot)
$port = 5187
$listener = $null
$started = $false

while (-not $started -and $port -lt 5200) {
    try {
        $listener = [Net.HttpListener]::new()
        $listener.Prefixes.Add("http://127.0.0.1:$port/")
        $listener.Start()
        $started = $true
    } catch {
        if ($listener) { $listener.Close() }
        $listener = $null
        $port++
    }
}

if (-not $started) {
    Write-Host 'No encontré un puerto libre entre 5187 y 5199.' -ForegroundColor Red
    Read-Host 'Presiona Enter para cerrar'
    exit 1
}

$url = "http://127.0.0.1:$port/"
Write-Host "Brilla está disponible en $url" -ForegroundColor Cyan
Write-Host 'Deja esta ventana abierta mientras uses Brilla. Presiona Ctrl+C para detener el servidor.'
Start-Process $url

$types = @{
    '.html' = 'text/html; charset=utf-8'
    '.js' = 'text/javascript; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg' = 'image/svg+xml'
    '.png' = 'image/png'
    '.jpg' = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.ico' = 'image/x-icon'
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        try {
            $relative = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
            if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
            $file = [IO.Path]::GetFullPath([IO.Path]::Combine($root, $relative))
            $allowedPrefix = $root.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar

            if (-not $file.StartsWith($allowedPrefix, [StringComparison]::OrdinalIgnoreCase) -or -not [IO.File]::Exists($file)) {
                $context.Response.StatusCode = 404
                $bytes = [Text.Encoding]::UTF8.GetBytes('No encontrado')
                $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $bytes = [IO.File]::ReadAllBytes($file)
                $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
                if ($types.ContainsKey($ext)) { $context.Response.ContentType = $types[$ext] }
                else { $context.Response.ContentType = 'application/octet-stream' }
                $context.Response.Headers.Add('Cache-Control', 'no-store')
                $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } catch {
            $context.Response.StatusCode = 500
        } finally {
            $context.Response.OutputStream.Close()
        }
    }
} finally {
    if ($listener) { $listener.Close() }
}
