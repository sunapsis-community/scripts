########################################################################################################
#PowerShell script to monitor the ColdFusion undelivered folder and email an alert when a change is detected.
#
# Windows Task Scheduler should be configure to run C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe with Arguments pointing to the script file
#IMMI-200
########################################################################################################

#Setup your environment variables
$undeliveredFolder = "C:\ColdFusion2018\cfusion\Mail\Undelivr"
$scriptFolder = "C:\ColdFusion2018\cfusion\Mail\Undelivered-Mail-Script"

$mailServer = ""
$emailPort = "587"
$emailUser = ""
$emailPassword = ""
$fromAddress  = ""
$toAddress = @("address1","address2")

#script variables
$date = get-date
$todaycount = (Get-ChildItem $undeliveredFolder -File | Measure-Object).count

#Check existence of the files used in the script.
if ( !(Test-Path -path "$scriptFolder\last-count") )
{
    New-Item -Path $scriptFolder -Name "last-count" -ItemType File
	$todaycount | Out-File -filepath "$scriptFolder\last-count"
}
if ( !(Test-Path -path "$scriptFolder\history.log") )
{
    New-Item -Path "$scriptFolder" -Name "history.log" -ItemType File
}

$lastcount = Get-Content "$scriptFolder\last-count"

##check today's count of emails vs the last count. If the same, then print to log. If different, print to log, send notification email, and update lastcount.
if ($lastcount -ne $todaycount)
{
	Add-content -path "$scriptFolder\history.log" -value ("$date -- There was a change in number of emails.")

    $emailSubject = "Compass undelivered emails increased by $($todaycount-$lastcount)"
	$emailMessage = "<p>The number of undelivered emails on compass.uga.edu increased by $($todaycount-$lastcount).<p>"
	
	$User = $emailUser
	$cred = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $User,
					(Get-Content -path $emailPassword |	ConvertTo-SecureString -asplaintext -force)

	$MailServerParams = @{
		From  = $fromAddress
		To = $toAddress
		Subject = $emailSubject
		Smtpserver = $mailServer
		BodyAsHtml = $true
		Body = $emailMessage
		Credential = $cred
		Port = $emailPort
    }
		
	Send-MailMessage @MailServerParams

	$todaycount | Out-File -filepath "$scriptFolder\last-count"
}
elseif ($lastcount -eq $todaycount)
{
	Add-content -path "$scriptFolder\history.log" -value ("$date -- No email changes.")
}
