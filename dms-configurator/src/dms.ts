/**
 * Wraps the AWS DMS API.
 */
import * as DMS from 'aws-sdk/clients/dms'; // just the DMS apis, not the whole SDK
import * as escapeJSON from 'escape-json-node';
import { getLogger } from './util';
import { resolve } from 'url';

export class DmsApi {
    private dms;
    private logger = getLogger('DmsApi', 'debug');

    constructor(readonly region: string) {
        this.dms = new DMS({apiVersion: '2016-01-01', region: `${region}`});
    }

    getEndpointArn(identifier: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {

            const params = {
                Filters: [{
                    Name: 'endpoint-id',
                    Values: [ identifier ]
                }]
            };

            this.dms.describeEndpoints(params, (err, data) => {
                if (err) {
                    this.logger.error('Error calling describeEndpoints: %j', err);
                    reject(err);

                } else if (data.Endpoints.length === 0) {
                    this.logger.error('Endpoint %s not found', identifier);
                    reject('No such endpoint');

                } else {
                    resolve(data.Endpoints[0].EndpointArn);
                }
            });
        });
    }

    getReplicationInstanceArn(identifier: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {

            const params = {
                Filters: [{
                    Name: 'replication-instance-id',
                    Values: [ identifier ]
                }]
            };

            this.dms.describeReplicationInstances(params, (err, data) => {
                if (err) {
                    this.logger.error("Error calling describeReplicationInstances: %j", err);
                    reject(err);

                } else if (data.ReplicationInstances.length === 0) {
                    this.logger.error("Replication Instance %s not found", identifier);
                    reject('No such instance');

                } else {
                    resolve(data.ReplicationInstances[0].ReplicationInstanceArn);
                }
            });
        });
    }

    async createOrUpdateFullLoadTask(taskName: string, replicationInstanceArn: string, 
                                     sourceEndpointArn: string, destEndpointArn: string,
                                     tableMappings: string): Promise<string> {
        try {
            const taskArn = await this.getTaskArn(taskName);
            this.logger.debug("Task %s already exists, so updating it...", taskName);
            return await this.updateTask(taskArn, tableMappings);

        } catch (e) {
            if (e === 'No such task') {
                this.logger.debug("Task %s doesn't already exist, so creating it...", taskName);
                return await this.createFullLoadTask(taskName, replicationInstanceArn,
                                                       sourceEndpointArn, destEndpointArn, tableMappings);
            }
            throw e;
        }
    }

    private createFullLoadTask(taskName: string, replicationInstanceArn: string, 
                               sourceEndpointArn: string, destEndpointArn: string,
                               tableMappings: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {

            const params = {
                MigrationType: 'full-load',
                ReplicationInstanceArn: replicationInstanceArn,
                ReplicationTaskIdentifier: taskName,
                SourceEndpointArn: sourceEndpointArn,
                TableMappings: escapeJSON(tableMappings),
                TargetEndpointArn: destEndpointArn
            };

            this.dms.createReplicationTask(params, (err, data) => {
                if (err) {
                    this.logger.error("Error calling createReplicationTask: %j", err);
                    reject(err);

                } else {
                    resolve(data.ReplicationTask.Status);
                }
            });
        });
    }

    private updateTask(taskArn: string, tableMappings: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {

            const params = {
                ReplicationTaskArn: taskArn,
                TableMappings: escapeJSON(tableMappings)
            };

            this.dms.modifyReplicationTask(params, (err, data) => {
                if (err) {
                    this.logger.error("Error calling modifyReplicationTask: %j", err);
                    reject(err);

                } else {
                    resolve(data.ReplicationTask.Status);
                }
            });
        });
    }

    private getTaskArn(taskName: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {

            const params = {
                Filters: [{
                    Name: 'replication-task-id',
                    Values: [ taskName ]
                }]
            };

            this.dms.describeReplicationTasks(params, (err, data) => {
                if (err) {
                    this.logger.error("Error calling describeReplicationTasks: %j", err);
                    reject(err);

                } else if (data.ReplicationTasks.length === 0) {
                    this.logger.error("Replication Task %s not found", taskName);
                    reject('No such task');

                } else {
                    resolve(data.ReplicationTasks[0].ReplicationTaskArn);
                }
            });
        });
    }
}