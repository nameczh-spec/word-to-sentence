' VocabTool Launcher
' Double-click to start without console window.
' Close browser tab to auto-stop the server.

Dim ws, fso, fs, scriptDir, binDir, nodeExe, url
Set ws = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
binDir = scriptDir & "\bin"
nodeExe = binDir & "\node.exe"
url = "http://localhost:8080"

' --- Auto-download Node.js if not found ---
If Not fso.FileExists(nodeExe) Then
    If Not fso.FolderExists(binDir) Then fso.CreateFolder(binDir)
    Dim tempFile
    tempFile = scriptDir & "\node_download.zip"
    ws.Run "powershell -Command ""[Net.ServicePointManager]::SecurityProtocol = 'Tls12'; try { Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.16.0/node-v22.16.0-win-x64.zip' -OutFile '" & tempFile & "' -UseBasicParsing } catch { exit 1 }"" ", 0, True
    If Not fso.FileExists(tempFile) Then
        MsgBox "Failed to download Node.js." & vbCrLf & "Check internet connection and try again.", vbExclamation, "Download Failed"
        WScript.Quit
    End If
    ws.Run "powershell -Command ""Expand-Archive -Path '" & tempFile & "' -DestinationPath '" & binDir & "' -Force; Move-Item '" & binDir & "\node-v22.16.0-win-x64\node.exe' '" & nodeExe & "' -Force; Remove-Item '" & binDir & "\node-v22.16.0-win-x64' -Recurse -Force"" ", 0, True
    fso.DeleteFile tempFile, True
End If

If Not fso.FileExists(nodeExe) Then
    MsgBox "Node.js not found." & vbCrLf & "Please download manually:", vbExclamation, "Error"
    WScript.Quit
End If

' --- Start proxy (port 3000, hidden) ---
Dim proxyCmd
proxyCmd = """" & nodeExe & """ """ & scriptDir & "\youdao-proxy.js"""
ws.Run proxyCmd, 0, False

' --- Start server (port 8080, hidden) ---
Dim cmd
cmd = """" & nodeExe & """ """ & scriptDir & "\server.js"""
ws.Run cmd, 0, False

' Wait for services to start
WScript.Sleep 3000

' --- Open browser normally ---
Dim sa
Set sa = CreateObject("Shell.Application")
sa.ShellExecute url, "", "", "open", 1
