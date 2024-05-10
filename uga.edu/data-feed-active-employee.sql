/****************************************************************/
/** HR Active Int'l Employee Data Feed - UGA Data Warehouse HCM */
/****************************************************************/
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
			CASE WHEN Name_Suffix = '#NA' THEN ' ' ELSE Name_Suffix END AS prsn_prm_sfx_nm
			,CASE WHEN Last_Name = '#NA' THEN ' ' ELSE Last_Name END AS prsn_prm_last_nm
			,CASE WHEN First_Name = '#NA' THEN ' ' ELSE First_Name END AS prsn_prm_1st_nm
			,CASE WHEN Middle_Name= '#NA' THEN ' ' ELSE Middle_Name END AS prsn_prm_mid_nm
			,Sex as prsn_gndr_cd
			,Marital_Status_Code as prsn_martl_stat_cd
			,FORMAT(BirthDate,'yyyy-MM-dd') as prsn_birth_dt
			,Alternate_Email as prsn_other_email_id
			,UGA_Email as prsn_gds_cmp_email_addr
			,UGA_MYID as prsn_ntwrk_id
		FROM
			restricted.PERSON_ATTRIBUTES_RESTRICTED_VW biographical 
		WHERE 
			biographical.Emplid = record.Emplid 
		FOR XML AUTO, TYPE, ELEMENTS
	)
	/*******************************/
	/***CITIZENSHIP***/
	,(
		SELECT top 1 
			Visa_Permit_Type_Code AS prsn_vprmt_typ_cd, [Citizenship_Country_Code] AS prsn_ctzn_cntry_cd
		FROM 
			sds.[PERSON_ATTRIBUTES_VW] visaCitizenship
		WHERE
			visaCitizenship.Emplid = visa.Emplid
			AND NOT EXISTS 
				(
					SELECT 0 
					FROM 
						[PS_HCM_SDS].[sds].[PERSON_ATTRIBUTES_VW] limiter 
					WHERE 
						visaCitizenship.Emplid=limiter.Emplid 
						AND limiter.Visa_Permit_Data_Eff_Start_Date > visaCitizenship.Visa_Permit_Data_Eff_Start_Date
				)
		FOR XML AUTO, TYPE, ELEMENTS
	)
	/*******************************/

/****************************************************************************************************************************************************/
	,( /*@@@@@@@@@@@@@ SINGLE EMPLOYEE @@@@@@@@@@@@@@@@@@@*/
		SELECT top 1
			( /**################ BEGIN ALL ACTIVE POSITION(S) -> JOB ##################**/
				SELECT
					employee.Position_No AS pos_nbr --1
					,employee.BOR_Job_Title AS pos_desc --2
					,employee.HR_Status_Code AS emp_stat_cd --3
					,FORMAT(employee.Termination_Date,'yyyy-MM-dd') as job_pos_exit_dt
					,LEFT(RIGHT(employee.JobCode_ID_Descr, LEN(JobCode_ID_Descr) - 9),30) AS job_emp_typ_desc
					,employee.JobCode_ID AS job_slry_plan_cd
					,employee.Annual_Benefits_Base_Rate AS job_comp_annl_rt --4
					,employee.Regular_Temporary_Code AS job_reg_temp_ind --5
					,employee.Full_Part_Time_Code AS job_full_pt_tm_ind --6
					,employee.FTE AS emp_tot_fte_rt --7
					,'UNIV' AS job_dept_setid_cd --8
					,employee.Dept_ID AS job_dept_id --9
				FROM
					[sds].[JOB_POSITION_VW] employee, [sds].[JOB_POSITION_CURRENT_SNAPSHOT_VW] position
				WHERE
					employee.Emplid = employees.Emplid --match person
					AND employee.Emplid = position.Emplid --match job
					AND employee.Position_No+' - '+employee.Position_Descr = position.Position_No_Descr
					AND employee.Position_No not in ('#NA')
					AND employee.Job_Eff_Date <= GETDATE()
					AND NOT EXISTS
					(
						SELECT 0 
						FROM 
							sds.JOB_POSITION_VW limiter
						WHERE
							limiter.emplid = employee.Emplid
							AND limiter.Position_No = employee.Position_No
							AND DATEADD(HOUR,limiter.Job_Eff_Seq,limiter.Job_Eff_Date) > DATEADD(HOUR,employee.Job_Eff_Seq,employee.Job_Eff_Date)
							AND limiter.Job_Eff_Date <= GETDATE()
					)
				GROUP BY 
                    Position_No
					,BOR_Job_Title
					,HR_Status_Code
					,JobCode_ID_Descr
					,JobCode_ID
					,Annual_Benefits_Base_Rate
					,Regular_Temporary_Code
					,employee.Full_Part_Time_Code
					,FTE
					,Termination_Date
					,Dept_ID
					,Job_Eff_Date
					,Job_Eff_Seq
				ORDER BY
					Job_Eff_Date DESC, Job_Eff_Seq DESC
				FOR XML AUTO, TYPE, ELEMENTS
			) /**################ BEGIN ALL ACTIVE POSITION(S) -> JOB ####################**/
			
		FROM [sds].[JOB_POSITION_VW] employees
		WHERE
			employees.Emplid = visa.Emplid
		FOR XML AUTO, TYPE, ELEMENTS
	) /*@@@@@@@@@@@@@@ END SINGLE EMPLOYEE @@@@@@@@@@@@@@@@*/
/****************************************************************************************************************************************************/

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
	--uses the UGA Data Warehouse "current snapshot table" to determine active employees in a position(s)
	(
		SELECT DISTINCT e.Emplid FROM sds.JOB_POSITION_CURRENT_SNAPSHOT_VW e
	) AS position 
WHERE
    record.Emplid = position.Emplid
	AND record.Emplid = visa.Emplid

ORDER BY 
	record.Emplid DESC

FOR XML AUTO, TYPE, ELEMENTS
/** End oustide loop **/
