import { ExaminerDeployment } from '../../../../domain/examiner-deployment';

export interface DeploymentRow {
  deployment_id: number;
  individual_id: number;
  tc_id: number;
  tc_name: string;
  tc_cost_centre_code: string;
  programme_date: string;
}

export const mapRow = (row: DeploymentRow): ExaminerDeployment => {
  return {
    examinerId: row.individual_id,
    deployment: {
      deploymentId: row.deployment_id,
      testCentre: {
        centreId: row.tc_id,
        centreName: row.tc_name,
        costCode: row.tc_cost_centre_code,
      },
      date: row.programme_date,
    },
  };
};
