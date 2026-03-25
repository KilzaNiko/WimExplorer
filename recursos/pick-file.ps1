Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.TopMost = $true
$form.WindowState = [System.Windows.Forms.FormWindowState]::Minimized
$form.ShowInTaskbar = $false
$form.Show()
$form.Hide()

$dlg = New-Object System.Windows.Forms.OpenFileDialog
$dlg.Filter = "WIM Files (*.wim;*.esd;*.swm)|*.wim;*.esd;*.swm|All Files (*.*)|*.*"
$dlg.Title = "Seleccionar archivo WIM - WimExplorer"

$result = $dlg.ShowDialog($form)
$form.Close()

if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output $dlg.FileName
} else {
    Write-Output ""
}
