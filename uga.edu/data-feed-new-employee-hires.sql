/********************************************************************/
/** HR New Hires Int'l Employee Data Feed - UGA Data Warehouse HCM */
/** Atlas Issue: UMDF-12 **/
/*******************************************************************/
--https://docs.microsoft.com/en-us/sql/relational-databases/xml/generate-siblings-with-a-nested-auto-mode-query?view=sql-server-2017#code-try-5
USE [PS_HCM_SDS]

/** Outside Loop should be a list of distinct emplids only**/	
SELECT
	/***IDENTITY****/
	record.Badge_No AS prsn_univ_id
	,(
		SELECT DISTINCT 
		emplid as associatedIDNumber 
		FROM
			sds.[PERSON_ATTRIBUTES_VW] associatedIDNumbers 
		WHERE 
			associatedIDNumbers.emplid=record.emplid 
		FOR xml auto, type, elements
	)
	/*******************************/
	/***BIOGRAPHICAL***/
	,(
		SELECT DISTINCT
			CASE WHEN Last_Name = '#NA' THEN ' ' ELSE Last_Name END AS prsn_prm_last_nm
			,CASE WHEN First_Name = '#NA' THEN ' ' ELSE First_Name END AS prsn_prm_1st_nm
			,Sex as prsn_gndr_cd
			,FORMAT(BirthDate,'yyyy-MM-dd') as prsn_birth_dt
			,UGA_MYID as prsn_ntwrk_id
		FROM
			restricted.PERSON_ATTRIBUTES_RESTRICTED_VW biographical 
		WHERE 
			biographical.Emplid = record.Emplid 
		FOR XML AUTO, TYPE, ELEMENTS
	)
	/*******************************/

FROM
	--select the emplid id and UGA id number
	(
		SELECT DISTINCT p.emplid,p.Badge_No FROM [sds].[PERSON_ATTRIBUTES_VW] p WHERE p.Badge_No NOT IN ('#NA')
	) AS record,
	--JOIN employee on the visa info, making sure to find a correctly coded visa row
	(
		SELECT DISTINCT 
			v.emplid 
		FROM 
			sds.[PERSON_ATTRIBUTES_VW] v 
		WHERE
			--scenario 1 - Citizenship code is not USA and Visa type is not #na
			v.Citizenship_Country_Code NOT IN ('USA')
			AND v.Visa_Permit_Type_Code NOT IN ('#NA')
			--OR the Citizenship country is not USA and the Visa country code is USA
			--OneUSG Citizenship country code should always be NOT USA. OneUSG visa Country Code should always be USA.
			OR
			(
				v.Citizenship_Country_Code NOT IN ('USA')
				AND v.Visa_Country_Code_Descr IN ('USA - United States')
			)
	) AS visa,
	--uses the UGA Data Warehouse all history for positions
	(
		SELECT DISTINCT e.Emplid FROM sds.JOB_POSITION_VW e WHERE Last_Hire_Date > GETDATE()
	) AS position 
WHERE
    record.Emplid = position.Emplid
	AND record.Emplid = visa.Emplid

ORDER BY 
	record.Emplid DESC

FOR XML AUTO, TYPE, ELEMENTS
/** End oustide loop **/
