/*
For Reference:

*/

DECLARE @sourceDB as nvarchar(100), @destinationDB as nvarchar(100)

SET @sourceDB = '[InternationalServices-itest]'
SET @destinationDB = '[InternationalServices-alpha]'

Declare @reference_add_form_ids Table (id integer primary Key not null)
Declare @reference_update_form_ids Table (id integer primary Key not null)
Declare @reference_add_IStartServices Table (id integer primary Key not null)
Declare @reference_update_IStartServices Table (id integer primary Key not null)
Declare @reference_add_codeTemplate Table (id integer primary Key not null)
Declare @reference_update_codeTemplate Table (id integer primary Key not null)
Declare @reference_add_IStartEFormEmails Table (id integer primary Key not null)
Declare @reference_update_IStartEFormEmails Table (id integer primary Key not null)

--####NEW####---
Declare @reference_add_configAlertService Table (id integer primary Key not null)
Declare @reference_update_configAlertService Table (id integer primary Key not null)
Declare @reference_add_IStartDepartmentTemplate Table (id integer primary Key not null)
Declare @reference_update_IStartDepartmentTemplate Table (id integer primary Key not null)
Declare @reference_add_configFormLetters Table (id integer primary Key not null)
Declare @reference_update_configFormLetters Table (id integer primary Key not null)
Declare @reference_add_IStartEFormAlerts Table (id integer primary Key not null)
Declare @reference_update_IStartEFormAlerts Table (id integer primary Key not null)
Declare @reference_add_IStartEFormSEVISAction Table (id integer primary Key not null)
Declare @reference_update_IStartEFormSEVISAction Table (id integer primary Key not null)
--####NEW####---

INSERT @reference_add_form_ids(id) values (NULL)
INSERT @reference_update_form_ids(id) values (NULL)
INSERT @reference_add_IStartServices(id) values (NULL)
INSERT @reference_update_IStartServices(id) values (NULL)
INSERT @reference_add_codeTemplate(id) values (NULL)
INSERT @reference_update_codeTemplate(id) values (NULL)
INSERT @reference_add_IStartEFormEmails(id) values (NULL)
INSERT @reference_update_IStartEFormEmails(id) values (NULL)
INSERT @reference_add_configAlertService(id) values (NULL)
INSERT @reference_update_configAlertService(id) values (NULL)
INSERT @reference_add_IStartDepartmentTemplate(id) values (NULL)
INSERT @reference_update_IStartDepartmentTemplate(id) values (NULL)
INSERT @reference_add_configFormLetters(id) values (NULL)
INSERT @reference_update_configFormLetters(id) values (NULL)
INSERT @reference_add_IStartEFormAlerts(id) values (NULL)
INSERT @reference_update_IStartEFormAlerts(id) values (NULL)
INSERT @reference_add_IStartEFormSEVISAction(id) values (NULL)
INSERT @reference_update_IStartEFormSEVISAction(id) values (NULL)

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
--ADD GROUP
--NOTE: Once the group is added, it is highly likely that a new group id will be assigned, this will need to be updated to all associated copied eforms.
DECLARE @g_id as int
DECLARE istartEformGroupIDs CURSOR FOR SELECT id from @reference_add_form_group
OPEN istartEformGroupIDs
FETCH NEXT FROM istartEformGroupIDs INTO @g_id
WHILE @@FETCH_STATUS=0
BEGIN
	EXEC('
		insert into '+@destinationDB+'.dbo.[IStartEFormGroup]
			([title],[metaInfo],[description],[menuTitle],[datestamp],[campus],[menuCategory],[adminApplicationArea],[admissionApplicationArea],[clientApplicationArea],[requireDepartmentRequest],[multiSubmit],[keystoneClosureFlag],[keystoneDescriptionFlag],[informationalDisplayOnly],[defaultAccess])
		select
			[title],[metaInfo],[description],[menuTitle],[datestamp],[campus],[menuCategory],[adminApplicationArea],[admissionApplicationArea],[clientApplicationArea],[requireDepartmentRequest],[multiSubmit],[keystoneClosureFlag],[keystoneDescriptionFlag],[informationalDisplayOnly],[defaultAccess]
		FROM 
			'+@sourceDB+'.[dbo].[IStartEFormGroup]
		where recnum = '+@g_id+'
	')
FETCH NEXT FROM istartEformGroupIDs INTO @g_id
END
CLOSE istartEformGroupIDs
DEALLOCATE istartEformGroupIDs
/*************************************************************************************************/
								PRINT 'ISTART EFORM SERVICES'
/*************************************************************************************************/
/*******ADD ISTART EFORM SERVICES*******/
DECLARE @s_id as int
DECLARE istartServiceIDs CURSOR FOR SELECT id from @reference_add_IStartServices
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
DECLARE serviceIDs CURSOR FOR SELECT id from @reference_update_IStartServices
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
DECLARE templateIDs CURSOR FOR SELECT id from @reference_add_codeTemplate

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
DECLARE templateIDs CURSOR FOR SELECT id from @reference_update_codeTemplate
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
DECLARE emailIDs CURSOR FOR SELECT id from @reference_add_IStartEFormEmails

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
DECLARE emailIDs CURSOR FOR SELECT id from @reference_update_IStartEFormEmails

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
