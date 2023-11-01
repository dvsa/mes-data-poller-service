import { JournalRecord } from '../../../domain/journal-record';
import moment = require('moment');
import { debug } from '@dvsa/mes-microservice-common/application/utils/logger';

/**
 * Encapsulates a cache of journal hashes.
 */
export class JournalHashesCache {
  pollerFrequency: number;
  previousStartTime: Date;
  hashes: Map<string, Partial<JournalRecord>>;

  /**
   * Creates a new instance.
   * @param pollerFrequency The frequency in seconds
   */
  constructor(pollerFrequency: number) {
    this.pollerFrequency = pollerFrequency;
    this.previousStartTime = null;
    this.hashes = new Map();
  }

  /**
   * Populate the cache with an array of journal hashes. Deletes any previous data.
   * @param hashes The data to cache
   * @param startTime The start time of the Lambda invocation that read the data being cached
   */
  clearAndPopulate(hashes: Partial<JournalRecord>[], startTime: Date) {
    this.hashes.clear();
    hashes.forEach(journalHash => this.hashes.set(journalHash.staffNumber, journalHash));
    this.previousStartTime = startTime;
  }

  /**
   * Get the cached data.
   * @returns The array of journal hashes
   */
  get(): Partial<JournalRecord>[] {
    return Array.from(this.hashes.values());
  }

  /**
   * Update the cached data, adding/updating entries as needed. Existing entries are not removed.
   * @param updatedStartTime The start time of the Lambda invocation that read the data being updated
   * @param updatedHashes The updated data
   */
  update(updatedStartTime: Date, updatedHashes: Partial<JournalRecord>[]) {
    updatedHashes.forEach(journalHash => this.hashes.set(journalHash.staffNumber, journalHash));
    this.previousStartTime = updatedStartTime;
  }

  /**
   * Identifies whether the cache has been populated and if the cached data is still valid. If another Lambda invocation
   * has happened since the data was cached, the cached data is stale. A 20% tolerance is used when comparing timings.
   * @param currentStartTime The time of the current Lambda invocation
   * @returns true if valid
   */
  isValid(currentStartTime: Date): boolean {
    if (this.previousStartTime) {
      /*
       * Check whether the current lambda function execution is the immediately subsequent execution to the previous
       * one. If not then another different lambda instance has run, possibly writing journal updates to dynamo,
       * therefore the cache is stale.
       */
      const timeDifference = moment.duration(moment(currentStartTime).diff(this.previousStartTime)).asSeconds();

      // use a 20% tolerance
      const maxDifference = this.pollerFrequency * 1.2;
      const minDifference = this.pollerFrequency * 0.8;

      return (timeDifference <= maxDifference) && (timeDifference >= minDifference);
    }
    return false;
  }

  /**
   * Logs the cache contents.
   */
  debug() {
    debug(`map has ${this.hashes.size} entries`);
    this.hashes.forEach((value: Partial<JournalRecord>, key: string) => {
      debug(`map entry ${key} -> ${JSON.stringify(value)}`);
    });
  }
}
