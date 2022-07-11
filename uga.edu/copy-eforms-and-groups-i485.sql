/*
For Reference:

select * from IStartEForms where serviceID in (select serviceID from IStartServices where serviceID in ('EFormSupplementJform0ServiceProvider','EFormPREmployeeInformation0ServiceProvider','EFormI485ApplicationAdjustmentofStatustoImmigrant0ServiceProvider','EFormAddressHistoryForm0ServiceProvider','EFormI485I131Information0ServiceProvider','EFormI485I765Information0ServiceProvider','EFormI485DependentInformation0ServiceProvider','EFormOrganizationMembershipForm0ServiceProvider','EFormPriorMarriageHistoryForm0ServiceProvider','EFormI485G325aInformation0ServiceProvider','EFormPREmployeeNotifyDeptofFormsCompletion0ServiceProvider','EFormEmploymentHistoryForm0ServiceProvider','EFormI485FinalCertificationForm0ServiceProvider') AND associatedServiceID in (26)) order by recnum

select * from IStartServices where associatedServiceID in (26) order by recnum

select * from codeTemplate where recnum in (2115,2114,2113,2112)

select * from IStartEFormGroup where recnum in (26);

Looks like we need to disable IStartService
  1551	admission	I-485 - Adjustment of Status	I-485 Final Certification Form	EFormI485FinalCertificationForm0ServiceProvider
  1546	admission	I-485 - Adjustment of Status	Biographical Information Form	EFormI485G325aInformation0ServiceProvider
  
*/

DECLARE @sourceDB as nvarchar(100), @destinationDB as nvarchar(100)

SET @sourceDB = '[InternationalServices-itest]'
SET @destinationDB = '[InternationalServices-alpha]'

Declare @reference_add_form_ids Table (id integer primary Key not null)
Declare @reference_update_form_ids Table (id integer primary Key not null)
Declare @reference_add_istart_services_ids Table (id integer primary Key not null)
Declare @reference_update_istart_services_ids Table (id integer primary Key not null)
Declare @reference_add_template_ids Table (id integer primary Key not null)
Declare @reference_update_template_ids Table (id integer primary Key not null)
Declare @reference_add_email_ids Table (id integer primary Key not null)
Declare @reference_update_email_ids Table (id integer primary Key not null)

INSERT @reference_add_form_ids(id) values (505),(506),(508),(510),(511)
	--505	EFormAddressHistoryForm0ServiceProvider	Address History Form
	--506	EFormEmploymentHistoryForm0ServiceProvider	Employment History Form
	--508	EFormOrganizationMembershipForm0ServiceProvider	Organization Membership Form
	--510	EFormPriorMarriageHistoryForm0ServiceProvider	Prior Marriage History Form
	--511	EFormSupplementJform0ServiceProvider	Supplement J form
INSERT @reference_update_form_ids(id) values (444),(445),(446),(447),(448),(449)
	--444	EFormI485ApplicationAdjustmentofStatustoImmigrant0ServiceProvider	I-485 Application - Adjustment of Status to Immigrant
	--445	EFormI485DependentInformation0ServiceProvider	I-485 - Dependent Information
	--446	EFormI485G325aInformation0ServiceProvider	I-485 - G325a Information
	--447	EFormI485I765Information0ServiceProvider	I-485 - I-765 Information
	--448	EFormI485I131Information0ServiceProvider	I-485 - I-131 Information
	--449	EFormI485FinalCertificationForm0ServiceProvider	I-485 Final Certification Form
INSERT @reference_add_istart_services_ids(id) values (1619),(1620),(1622),(1624),(1625),(1626),(1627),(1628),(1629),(1630),(1631)
	--1619	client	Address History Form	EFormAddressHistoryForm0ServiceProvider
	--1620	client	Employment History Form	EFormEmploymentHistoryForm0ServiceProvider
	--1622	client	Organization Membership Form	EFormOrganizationMembershipForm0ServiceProvider
	--1624	client	Prior Marriage History Form	EFormPriorMarriageHistoryForm0ServiceProvider
	--1625	admission	Biographical Information Form	EFormI485G325aInformation0ServiceProvider
	--1626	admission	Address History Form	EFormAddressHistoryForm0ServiceProvider
	--1627	admission	Employment History Form	EFormEmploymentHistoryForm0ServiceProvider
	--1628	admission	Prior Marriage History Form	EFormPriorMarriageHistoryForm0ServiceProvider
	--1629	admission	Organization Membership Form	EFormOrganizationMembershipForm0ServiceProvider
	--1630	admission	I-485 Final Certification Form	EFormI485FinalCertificationForm0ServiceProvider
	--1631	client	Supplement J form	EFormSupplementJform0ServiceProvider
INSERT @reference_update_istart_services_ids(id) values (1372),(1373),(1374),(1375),(1376),(1377),(1547),(1548),(1549),(1550)
	--1372	client	Adjustment of Status Data Form	EFormI485ApplicationAdjustmentofStatustoImmigrant0ServiceProvider
	--1373	client	Children Information Form	EFormI485DependentInformation0ServiceProvider
	--1374	client	Biographical Information Form	EFormI485G325aInformation0ServiceProvider
	--1375	client	Work Card Information Form	EFormI485I765Information0ServiceProvider
	--1376	client	Travel Document Information Form	EFormI485I131Information0ServiceProvider
	--1377	client	I-485 Final Certification Form	EFormI485FinalCertificationForm0ServiceProvider
	--1547	admission	Work Card Information Form	EFormI485I765Information0ServiceProvider
	--1548	admission	Adjustment of Status Data Form	EFormI485ApplicationAdjustmentofStatustoImmigrant0ServiceProvider
	--1549	admission	Travel Document Information Form	EFormI485I131Information0ServiceProvider
	--1550	admission	Children Information Form	EFormI485DependentInformation0ServiceProvider
INSERT @reference_add_template_ids(id) values (2114)
	--2114	I-485	I--485 I-131
INSERT @reference_update_template_ids(id) values (2112),(2113)
	--2112	Permanent Residency	I-765 PR
	--2113	I-485	I-485-I-765
INSERT @reference_add_email_ids(id) values (null)
	--none
INSERT @reference_update_email_ids(id) values (null)
	--none

--BEGIN TRANSACTION
/*************************************************************************************************/
								PRINT 'ISTART EFORMS'
/*************************************************************************************************/
DECLARE @f_id as int
/**********ADD ISTARTEFORMS*******/
DECLARE formIDs CURSOR FOR SELECT id from @reference_add_form_ids

OPEN formIDs
FETCH NEXT FROM formIDs INTO @f_id
WHILE @@FETCH_STATUS=0
BEGIN
	EXEC('
		INSERT INTO '+@destinationDB+'.dbo.IStartEForms
			([serviceID],[serviceName],[data],[metaInfo],[datestamp])
		SELECT
			[serviceID],[serviceName],[data],[metaInfo],[datestamp]
		FROM
			'+@sourceDB+'.dbo.IStartEForms src
		WHERE src.recnum = '+@f_id+'
	')
FETCH NEXT FROM formIDs INTO @f_id
END
CLOSE formIDs
DEALLOCATE formIDs
/*******UPDATE ISTARTEFORMS******/
DECLARE formIDs CURSOR FOR SELECT id from @reference_update_form_ids

OPEN formIDs
FETCH NEXT FROM formIDs INTO @f_id
WHILE @@FETCH_STATUS=0
BEGIN
	EXEC('
		UPDATE
			'+@destinationDB+'.dbo.IStartEforms
		SET
			serviceName = src.serviceName,
			data = src.data,
			metaInfo = src.metaInfo,
			datestamp = src.datestamp
		FROM 
			'+@sourceDB+'.dbo.IStartEForms src
		WHERE
			IStartEforms.recnum = '+@f_id+' AND src.recnum = '+@f_id+'
	')
FETCH NEXT FROM formIDs INTO @f_id
END
CLOSE formIDs
DEALLOCATE formIDs


/*************************************************************************************************/
								PRINT 'EFORM GROUPS'
/*************************************************************************************************/
--TBD

/*************************************************************************************************/
								PRINT 'ISTART EFORM SERVICES'
/*************************************************************************************************/
/*******ADD ISTART EFORM SERVICES*******/
DECLARE @s_id as int
DECLARE istartServiceIDs CURSOR FOR SELECT id from @reference_add_istart_services_ids
OPEN istartServiceIDs
FETCH NEXT FROM istartServiceIDs INTO @s_id
WHILE @@FETCH_STATUS=0
BEGIN
	EXEC('
		insert into '+@destinationDB+'.dbo.[IStartServices]
			([applicationArea],[category],[serviceName],[serviceID],[associatedServiceID],[campus],[defaultAccess],[rank],[requiredInGroup],[subGroupHeading],[enabled])
		select
			[applicationArea],[category],[serviceName],[serviceID],[associatedServiceID],[campus],[defaultAccess],[rank],[requiredInGroup],[subGroupHeading],[enabled] 
		FROM 
			'+@sourceDB+'.[dbo].[IStartServices]
		where recnum = '+@s_id+'
	')
FETCH NEXT FROM istartServiceIDs INTO @s_id
END
CLOSE istartServiceIDs
DEALLOCATE istartServiceIDs

/*******UPDATE ISTART EFORM SERVICES*******/
DECLARE serviceIDs CURSOR FOR SELECT id from @reference_update_istart_services_ids
OPEN serviceIDs
FETCH NEXT FROM serviceIDs INTO @s_id
WHILE @@FETCH_STATUS=0
BEGIN
	EXEC('
		UPDATE '+@destinationDB+'.dbo.IStartServices
		SET
			applicationArea = src.applicationArea,
			category = src.category,
			serviceName = src.serviceName,
			serviceID = src.serviceID,
			associatedServiceID = src.associatedServiceID,
			campus = src.campus,
			defaultAccess = src.defaultAccess,
			rank = src.rank,
			requiredInGroup = src.requiredInGroup,
			subGroupHeading = src.subGroupHeading,
			enabled = src.enabled
		FROM '+@sourceDB+'.dbo.IStartServices src 
		WHERE IStartServices.recnum = '+@s_id+' AND src.recnum = '+@s_id+'
	')
FETCH NEXT FROM serviceIDs INTO @s_id
END
CLOSE serviceIDs
DEALLOCATE serviceIDs

/*************************************************************************************************/
									PRINT 'CODE TEMPLATES'
/*************************************************************************************************/
DECLARE @t_id as int

/*******ADD CODE TEMPLATE*******/
DECLARE templateIDs CURSOR FOR SELECT id from @reference_add_template_ids

OPEN templateIDs
FETCH NEXT FROM templateIDs INTO @t_id
WHILE @@FETCH_STATUS=0
BEGIN
	EXEC('
		INSERT INTO '+@destinationDB+'.dbo.codeTemplate ([campus],[groupid],[name],[template],[datestamp])
		SELECT [campus],[groupid],[name],[template],[datestamp] from '+@sourceDB+'.dbo.codeTemplate
		WHERE recnum = '+@t_id+'
	')
FETCH NEXT FROM templateIDs INTO @t_id
END
CLOSE templateIDs
DEALLOCATE templateIDs

/*******UPDATE CODE TEMPLATE*******/
DECLARE templateIDs CURSOR FOR SELECT id from @reference_update_template_ids
OPEN templateIDs
FETCH NEXT FROM templateIDs INTO @t_id
WHILE @@FETCH_STATUS=0
BEGIN
	EXEC('
		UPDATE '+@destinationDB+'.dbo.codeTemplate
		SET
			campus = src.campus,
			groupid = src.groupid,
			name = src.name,
			template = src.template,
			datestamp = src.datestamp
		FROM '+@sourceDB+'.dbo.codeTemplate src 
		WHERE codeTemplate.recnum = '+@t_id+' AND src.recnum = '+@t_id+'
	')
FETCH NEXT FROM templateIDs INTO @t_id
END
CLOSE templateIDs
DEALLOCATE templateIDs


/*************************************************************************************************/
									PRINT 'EFORM EMAILS'
/*************************************************************************************************/
DECLARE @e_id as int
/*************ADD EMAILS********************/
DECLARE emailIDs CURSOR FOR SELECT id from @reference_add_email_ids

OPEN emailIDs
FETCH NEXT FROM emailIDs INTO @e_id
WHILE @@FETCH_STATUS=0
BEGIN
	EXEC('
		INSERT INTO '+@destinationDB+'.dbo.IStartEFormEmails
			([serviceid],[emailContent],[datestamp],[title],[emailSubject],[ccEmails],[emailTemplate],[autoSend],[event],[client],[department],[approver],[sender],[prereqEForm],[bccEmails])
		SELECT 
			[serviceid],[emailContent],[datestamp],[title],[emailSubject],[ccEmails],[emailTemplate],[autoSend],[event],[client],[department],[approver],[sender],[prereqEForm],[bccEmails]
		FROM
			'+@sourceDB+'.dbo.IStartEFormEmails where recnum='+@e_id
	)
FETCH NEXT FROM emailIDs INTO @e_id
END
CLOSE emailIDs
DEALLOCATE emailIDs
/*************UPDATE EMAILS*******************/
DECLARE emailIDs CURSOR FOR SELECT id from @reference_update_email_ids

OPEN emailIDs
FETCH NEXT FROM emailIDs INTO @e_id
WHILE @@FETCH_STATUS=0
BEGIN
	EXEC('
			UPDATE '+@destinationDB+'.dbo.IStartEFormEmails
			SET 
				[serviceid] = src.[serviceid],
				[emailContent] = src.[emailContent],
				[datestamp] = src.[datestamp],
				[title] = src.[title],
				[emailSubject] = src.[emailSubject],
				[ccEmails] = src.[ccEmails],
				[emailTemplate] = src.[emailTemplate],
				[autoSend] = src.[autoSend],
				[event] = src.[event],
				[client] = src.[client],
				[department] = src.[department],
				[approver] = src.[approver],
				[sender] = src.[sender],
				[prereqEForm] = src.[prereqEForm],
				[bccEmails] = src.[bccEmails]
			FROM '+@sourceDB+'.dbo.IStartEFormEmails src
			where IStartEFormEmails.recnum = '+@e_id+' AND src.recnum = '+@e_id+'
		')
FETCH NEXT FROM emailIDs INTO @e_id
END
CLOSE emailIDs
DEALLOCATE emailIDs

--Rollback transaction
--COMMIT
PRINT 'FINISHED'
