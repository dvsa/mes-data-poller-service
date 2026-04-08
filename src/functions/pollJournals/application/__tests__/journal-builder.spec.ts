import { It, Mock, Times } from 'typemoq';
import * as journalCompressor from '../../application/journal-compressor';
import type { AllDatasets } from '../../domain/all-datasets';
import { buildJournals } from '../journal-builder';

const examiners = [
  {
    individual_id: 111,
    staff_number: '222',
  },
  {
    individual_id: 333,
    staff_number: '00444',
  },
];

const moqCompressJournal = Mock.ofInstance(journalCompressor.compressJournal);

describe('buildJournals', () => {
  beforeEach(() => {
    moqCompressJournal.reset();

    spyOn(journalCompressor, 'compressJournal').and.callFake(moqCompressJournal.object);

    moqCompressJournal.setup((x) => x(It.isAny())).returns(() => Buffer.from('firsthash'));
  });

  it('should include a journal for every examiner', () => {
    const datasets = {
      testSlots: [],
      personalCommitments: [],
      nonTestActivities: [],
      advanceTestSlots: [],
      deployments: [],
    };
    const result = buildJournals(examiners, datasets);

    expect(result.length).toBe(2);
    expect(result[0].staffNumber).toBe('222');
    expect(result[1].staffNumber).toBe('444');
  });

  it('should merge datasets for an examiner into a single journal', () => {
    const datasets: AllDatasets = {
      testSlots: [{ examinerId: 111, testSlot: { slotDetail: { slotId: 999 } } }],
      nonTestActivities: [{ examinerId: 111, nonTestActivity: { slotDetail: { slotId: 888 } } }],
      personalCommitments: [{ examinerId: 111, personalCommitment: { commitmentId: 777 } }],
      advanceTestSlots: [{ examinerId: 111, advanceTestSlot: { slotDetail: { slotId: 666 } } }],
      deployments: [{ examinerId: 111, deployment: { deploymentId: 555 } }],
    };

    const result = buildJournals(examiners, datasets);

    const journalToCompress = {
      examiner: { staffNumber: '222', individualId: 111 },
      testSlots: [{ slotDetail: { slotId: 999 } }],
      nonTestActivities: [{ slotDetail: { slotId: 888 } }],
      personalCommitments: [{ commitmentId: 777 }],
      advanceTestSlots: [{ slotDetail: { slotId: 666 } }],
      deployments: [{ deploymentId: 555 }],
    };
    moqCompressJournal.verify((x) => x(It.isValue(journalToCompress)), Times.once());
    expect(result.length).toBe(2);
    expect(result[0].journal).toEqual(Buffer.from('firsthash'));
  });

  it('should merge datasets including multiple examiners into the journal for each', () => {
    moqCompressJournal.setup((x) => x(It.isAny())).returns(() => Buffer.from('secondhash'));
    const datasets: AllDatasets = {
      testSlots: [
        { examinerId: 111, testSlot: { slotDetail: { slotId: 991 } } },
        { examinerId: 333, testSlot: { slotDetail: { slotId: 992 } } },
      ],
      nonTestActivities: [
        { examinerId: 111, nonTestActivity: { slotDetail: { slotId: 881 } } },
        { examinerId: 333, nonTestActivity: { slotDetail: { slotId: 882 } } },
      ],
      personalCommitments: [
        { examinerId: 111, personalCommitment: { commitmentId: 771 } },
        { examinerId: 333, personalCommitment: { commitmentId: 772 } },
      ],
      advanceTestSlots: [
        { examinerId: 111, advanceTestSlot: { slotDetail: { slotId: 661 } } },
        { examinerId: 333, advanceTestSlot: { slotDetail: { slotId: 662 } } },
      ],
      deployments: [
        { examinerId: 111, deployment: { deploymentId: 551 } },
        { examinerId: 333, deployment: { deploymentId: 552 } },
      ],
    };

    const result = buildJournals(examiners, datasets);

    const firstJournalToCompress = {
      examiner: { staffNumber: '222', individualId: 111 },
      testSlots: [{ slotDetail: { slotId: 991 } }],
      nonTestActivities: [{ slotDetail: { slotId: 881 } }],
      personalCommitments: [{ commitmentId: 771 }],
      advanceTestSlots: [{ slotDetail: { slotId: 661 } }],
      deployments: [{ deploymentId: 551 }],
    };
    const secondJournalToCompress = {
      examiner: { staffNumber: '444', individualId: 333 },
      testSlots: [{ slotDetail: { slotId: 992 } }],
      nonTestActivities: [{ slotDetail: { slotId: 882 } }],
      personalCommitments: [{ commitmentId: 772 }],
      advanceTestSlots: [{ slotDetail: { slotId: 662 } }],
      deployments: [{ deploymentId: 552 }],
    };
    moqCompressJournal.verify((x) => x(It.isValue(firstJournalToCompress)), Times.once());
    moqCompressJournal.verify((x) => x(It.isValue(secondJournalToCompress)), Times.once());
    expect(result.length).toBe(2);
    expect(result[0].journal).toEqual(Buffer.from('firsthash'));
    expect(result[1].journal).toEqual(Buffer.from('secondhash'));
  });

  it('should omit any journals where a numeric staff number cannot be derived', () => {
    const nonNumericExaminers = [
      {
        individual_id: 111,
        staff_number: 'o1234',
      },
    ];
    const datasets: AllDatasets = {
      testSlots: [{ examinerId: 111, testSlot: { slotDetail: { slotId: 999 } } }],
      nonTestActivities: [{ examinerId: 111, nonTestActivity: { slotDetail: { slotId: 888 } } }],
      personalCommitments: [{ examinerId: 111, personalCommitment: { commitmentId: 777 } }],
      advanceTestSlots: [{ examinerId: 111, advanceTestSlot: { slotDetail: { slotId: 666 } } }],
      deployments: [{ examinerId: 111, deployment: { deploymentId: 555 } }],
    };

    const result = buildJournals(nonNumericExaminers, datasets);

    expect(result.length).toBe(0);
  });

  it('should not include any journals that have the same staff number after leading zeros are stripped', () => {
    const duplicateExaminers = [
      {
        individual_id: 111,
        staff_number: '1234',
      },
      {
        individual_id: 222,
        staff_number: '01234',
      },
    ];
    const datasets: AllDatasets = {
      testSlots: [
        { examinerId: 111, testSlot: { slotDetail: { slotId: 999 } } },
        { examinerId: 222, testSlot: { slotDetail: { slotId: 888 } } },
      ],
      nonTestActivities: [],
      personalCommitments: [],
      advanceTestSlots: [],
      deployments: [],
    };

    const result = buildJournals(duplicateExaminers, datasets);

    expect(result.length).toBe(0);
  });
});
