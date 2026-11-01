# ==============================================================================
# L'ATELIER DU PARFUM - Auto GitHub Sync & Hosting Deployment Script
# ==============================================================================

param(
    [string]$CommitMessage = "feat: add 3-way theme modes (Light, Gray, Dark) and UI switchers"
)

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class CredSyncHelper {
    [DllImport("advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);

    [DllImport("advapi32.dll", EntryPoint = "CredFree", SetLastError = true)]
    public static extern void CredFree(IntPtr credentialPtr);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags;
        public int Type;
        public string TargetName;
        public string Comment;
        public long LastWritten;
        public int CredentialBlobSize;
        public IntPtr CredentialBlob;
        public int Persist;
        public int AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    public static string GetPassword(string target) {
        IntPtr credPtr;
        if (CredRead(target, 1, 0, out credPtr)) {
            var cred = (CREDENTIAL)Marshal.PtrToStructure(credPtr, typeof(CREDENTIAL));
            byte[] bytes = new byte[cred.CredentialBlobSize];
            Marshal.Copy(cred.CredentialBlob, bytes, 0, cred.CredentialBlobSize);
            CredFree(credPtr);
            return System.Text.Encoding.Unicode.GetString(bytes);
        }
        return null;
    }
}
"@

$token = [CredSyncHelper]::GetPassword("git:https://github.com")
if (!$token) {
    Write-Error "GitHub token not found in Windows Credential Manager."
    exit 1
}

$git = "$env:USERPROFILE\.local\git\cmd\git.exe"
if (!(Test-Path $git)) {
    $git = "git"
}

Write-Host ">>> 1. Checking git status..." -ForegroundColor Cyan
& $git add -A

$status = & $git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host ">>> Working tree clean, no new changes to commit." -ForegroundColor Yellow
} else {
    Write-Host ">>> 2. Committing changes: $CommitMessage" -ForegroundColor Cyan
    & $git commit -m "$CommitMessage"
}

Write-Host ">>> 3. Pushing to GitHub main branch..." -ForegroundColor Cyan
$authUrl = "https://hellouou:$token@github.com/hellouou/perfume.git"
$cleanUrl = "https://github.com/hellouou/perfume.git"

& $git remote set-url origin $authUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    & $git remote add origin $authUrl
}

& $git push origin main

& $git remote set-url origin $cleanUrl

Write-Host ">>> 4. Pushed successfully to GitHub!" -ForegroundColor Green
Write-Host ">>> Repository: https://github.com/hellouou/perfume" -ForegroundColor Green
Write-Host ">>> Live Site:   https://hellouou.github.io/perfume/" -ForegroundColor Green
