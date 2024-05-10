/****************************************************************/
/** HR Completed Employee Data Feed - UGA Data Warehouse HCM */
/****************************************************************/
--https://docs.microsoft.com/en-us/sql/relational-databases/xml/generate-siblings-with-a-nested-auto-mode-query?view=sql-server-2017#code-try-5
USE [PS_HCM_SDS]

/** Outside Loop should be a list of distinct emplids only**/
SELECT
	/***IDENTITY****/
	record.Badge_No AS prsn_univ_id
/****************************************************************************************************************************************************/
	/*@@@@@@@@@@@@@ SINGLE EMPLOYEE @@@@@@@@@@@@@@@@@@@*/
	,( SELECT top 1
			( /**################ BEGIN ALL ACTIVE POSITION(S) -> JOB ##################**/
				SELECT
					employee.Position_No AS pos_nbr --1
					,employee.BOR_Job_Title AS pos_desc --2
					,employee.HR_Status_Code AS emp_stat_cd --3
					,FORMAT(employee.Termination_Date,'yyyy-MM-dd') as job_pos_exit_dt
					,employee.Annual_Benefits_Base_Rate AS job_comp_annl_rt --4
					,employee.Regular_Temporary_Code AS job_reg_temp_ind --5
					,employee.Full_Part_Time_Code AS job_full_pt_tm_ind --6
					,employee.FTE AS emp_tot_fte_rt --7
					,'UNIV' AS job_dept_setid_cd --8
					,employee.Dept_ID AS job_dept_id --9
				FROM
					[sds].[JOB_POSITION_VW] employee
				WHERE
					employee.emplid=record.emplid
					AND
					employee.Position_No not in ('#NA')
					AND 
					( Termination_Date <= GETDATE() AND Termination_Date > (GETDATE()-120) )
					AND
					employee.Position_No = record.Position_No
					AND
						NOT EXISTS
						(	SELECT 0 
							FROM [sds].[JOB_POSITION_VW] limiter
							WHERE
								limiter.emplid = employee.Emplid
								AND limiter.Position_No = employee.Position_No
								AND DATEADD(HOUR,limiter.Job_Eff_Seq,limiter.Job_Eff_Date) > DATEADD(HOUR,employee.Job_Eff_Seq,employee.Job_Eff_Date)
								AND limiter.Job_Eff_Date <= GETDATE() )
				GROUP BY 
                    Position_No
					,BOR_Job_Title
					,HR_Status_Code
					,JobCode_ID_Descr
					,Annual_Benefits_Base_Rate
					,Regular_Temporary_Code
					,Full_Part_Time_Code
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
			employees.Emplid = record.Emplid
		FOR XML AUTO, TYPE, ELEMENTS
	) /*@@@@@@@@@@@@@@ END SINGLE EMPLOYEE @@@@@@@@@@@@@@@@*/
/****************************************************************************************************************************************************/

FROM
	--THE CONTROLLER (i.e. selection of records)
	(SELECT DISTINCT person.emplid, person.Badge_No, Position_No
		FROM sds.[PERSON_ATTRIBUTES_VW] person, sds.JOB_POSITION_VW job
		WHERE
			person.emplid=job.emplid
			AND
			--scenario 1 - Citizenship code is not USA and Visa type is not #na--OR the Citizenship country is not USA and the Visa country code is USA --OneUSG Citizenship country code should always be NOT USA. OneUSG visa Country Code should always be USA.
			(
				Citizenship_Country_Code NOT IN ('USA')	AND Visa_Permit_Type_Code NOT IN ('#NA')
				OR
				( Citizenship_Country_Code NOT IN ('USA') AND Visa_Country_Code_Descr IN ('USA - United States') )
			)
			AND
			Position_No not in ('#NA')
			AND
			( Termination_Date > (GETDATE()-120) AND Termination_Date < GETDATE() )

	) AS record

ORDER BY 
	record.Emplid DESC

FOR XML AUTO, TYPE, ELEMENTS
/** End oustide loop **/
