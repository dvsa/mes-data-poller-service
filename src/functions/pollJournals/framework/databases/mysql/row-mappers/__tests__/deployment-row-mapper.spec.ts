import { mapRow } from '../deployment-row-mapper';

describe('Deployment Row Mapper', () => {
  it('should map a DeploymentRow to an ExaminerDeployment', () => {
    const result = mapRow({
      deployment_id: 1,
      individual_id: 2,
      tc_id: 3,
      tc_name: 'centre',
      tc_cost_centre_code: 'costcode',
      programme_date: '2019-02-15 00:00:00',
    });
    expect(result).toEqual(
      {
        examinerId: 2,
        deployment: {
          deploymentId: 1,
          testCentre: {
            centreId: 3,
            centreName: 'centre',
            costCode: 'costcode',
          },
          date: '2019-02-15 00:00:00',
        },
      },
    );
  });
});
