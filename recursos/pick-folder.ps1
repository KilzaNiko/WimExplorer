Add-Type -AssemblyName System.Windows.Forms
$dlg = New-Object System.Windows.Forms.FolderBrowserDialog
$dlg.Description = 'Seleccionar carpeta destino'
$dlg.ShowNewFolderButton = $true

# Create a topmost helper form so the dialog appears in foreground
Add-Type -AssemblyName System.Drawing
$form = New-Object System.Windows.Forms.Form
$form.TopMost = $true
$form.WindowState = 'Minimized'
$form.ShowInTaskbar = $false
$form.Show()
$form.Hide()

$result = $dlg.ShowDialog($form)
$form.Close()
if ($result -eq 'OK') { Write-Output $dlg.SelectedPath } else { Write-Output '' }
