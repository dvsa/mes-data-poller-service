import { mapRow, GenderCode } from '../test-slot-row-mapper';

describe('TestSlot Row Mapper', () => {

  const sampleRow = {
    slot_id: 1,
    start_time: new Date('2019-02-12 08:20:00'),
    minutes: 57,
    vehicle_type_code: '6',
    vehicle_slot_type_code: 1,
    tc_id: 3,
    tc_cost_centre_code: 'costcentre',
    tc_name: 'testcentre',
    individual_id: 4,
    programme_date: '2019-02-12 00:00:00',
    booking_id: 5,
    app_id: 6,
    booking_seq: 7,
    check_digit: 8,
    welsh_test_ind: 1,
    ext_req_ind: 0,
    progressive_access: 0,
    meeting_place: 'meeting',
    special_needs: 'special',
    special_needs_extended_test: 0,
    special_needs_code: 'NONE',
    ent_check_ind: 1,
    cab_seat_count: 9,
    passenger_seat_count: 10,
    height_metres: 11,
    length_metres: 12,
    width_metres: 13,
    vehicle_category: 'vehcat',
    gearbox_type: 1,
    candidate_id: 14,
    candidate_title: 'Mr',
    candidate_first_name: 'Joe',
    candidate_second_name: 'Adam',
    candidate_third_name: 'Kyle',
    candidate_surname: 'Bloggs',
    candidate_driver_number: '16',
    candidate_date_of_birth: new Date('1990-05-12'),
    candidate_gender_code: GenderCode.Male,
    candidate_ethnicity_code: 'A',
    cand_primary_tel_ind: 1,
    cand_primary_tel: '0011',
    cand_secondary_tel_ind: 1,
    cand_secondary_tel: '2233',
    cand_mobile_tel_ind: 1,
    cand_mobile_tel: '4455',
    cand_email: 'joe.bloggs@example.com',
    candidate_addr_line1: 'addr1',
    candidate_addr_line2: 'addr2',
    candidate_addr_line3: 'addr3',
    candidate_addr_line4: 'addr4',
    candidate_addr_line5: 'addr5',
    candidate_post_code: 'abc123',
    candidate_prn: 17,
    prev_attempts: 18,
    business_id: 18,
    business_name: 'business',
    business_addr_line1: 'ba1',
    business_addr_line2: 'ba2',
    business_addr_line3: 'ba3',
    business_addr_line4: 'ba4',
    business_addr_line5: 'ba5',
    business_post_code: 'bpc',
    business_telephone: '6677',
    cancel_initiator: 'DSA,Act of nature',
    examiner_deployed_to_from_code: null,
    cat_ent_check_ind: null,
    integrity_ind: 1,
    integrity_case_number: 'CASE NUM',
  };

  it('should map a fully populated TestSlotRow to an ExaminerTestSlot', () => {
    const result = mapRow(sampleRow);
    expect(result).toEqual(
      {
        examinerId: 4,
        testSlot: {
          booking: {
            application: {
              applicationId: 6,
              bookingSequence: 7,
              checkDigit: 8,
              welshTest: true,
              extendedTest: false,
              meetingPlace: 'meeting',
              progressiveAccess: false,
              specialNeeds: 'special',
              specialNeedsExtendedTest: false,
              specialNeedsCode: 'NONE',
              entitlementCheck: true,
              vehicleSeats: 19,
              vehicleHeight: 11,
              vehicleWidth: 13,
              vehicleLength: 12,
              testCategory: 'vehcat',
              vehicleGearbox: 'Manual',
              categoryEntitlementCheck: false,
              fitMarker: true,
              fitCaseNumber: 'CASE NUM',
            },
            business: {
              businessAddress: {
                addressLine1: 'ba1',
                addressLine2: 'ba2',
                addressLine3: 'ba3',
                addressLine4: 'ba4',
                addressLine5: 'ba5',
                postcode: 'bpc',
              },
              businessId: 18,
              businessName: 'business',
              telephone: '6677',
            },
            candidate: {
              candidateAddress: {
                addressLine1: 'addr1',
                addressLine2: 'addr2',
                addressLine3: 'addr3',
                addressLine4: 'addr4',
                addressLine5: 'addr5',
                postcode: 'abc123',
              },
              candidateId: 14,
              candidateName: {
                firstName: 'Joe',
                secondName: 'Adam',
                thirdName: 'Kyle',
                lastName: 'Bloggs',
                title: 'Mr',
              },
              driverNumber: '16',
              dateOfBirth: '1990-05-12',
              gender: 'M',
              ethnicityCode: 'A',
              emailAddress: 'joe.bloggs@example.com',
              mobileTelephone: '4455',
              primaryTelephone: '0011',
              secondaryTelephone: '2233',
              previousADITests: 18,
              prn: 17,
            },
            previousCancellation: [
              'DSA',
              'Act of nature',
            ],
          },
          slotDetail: {
            duration: 57,
            slotId: 1,
            start: '2019-02-12T08:20:00',
          },
          testCentre: {
            centreId: 3,
            centreName: 'testcentre',
            costCode: 'costcentre',
          },
          vehicleTypeCode: '6',
          vehicleSlotTypeCode: 1,
          examinerVisiting: false,
        },
      },
    );
  });

  it('should map a slot for a female candidate to the correct gender indicator', () => {
    const result = mapRow({
      ...sampleRow,
      candidate_gender_code: GenderCode.Female,
    });
    expect(result.testSlot.booking.candidate.gender).toBe('F');
  });

  it('should indicate the fact that an examiner is not at their home test centre', () => {
    const result = mapRow({
      ...sampleRow,
      examiner_deployed_to_from_code: 0,
    });
    expect(result.testSlot.examinerVisiting).toBe(true);
  });

  it('should map an empty slot to an ExaminerTestSlot', () => {
    const result = mapRow({
      slot_id: 1,
      start_time: new Date('2019-02-12 08:20:00'),
      minutes: 57,
      vehicle_type_code: null,
      vehicle_slot_type_code: null,
      tc_id: 3,
      tc_cost_centre_code: 'costcentre',
      tc_name: 'testcentre',
      individual_id: 4,
      programme_date: '2019-02-12 00:00:00',
      booking_id: null,
      app_id: null,
      booking_seq: null,
      check_digit: null,
      welsh_test_ind: null,
      ext_req_ind: null,
      progressive_access: null,
      meeting_place: null,
      special_needs: null,
      special_needs_extended_test: null,
      special_needs_code: null,
      ent_check_ind: null,
      cab_seat_count: null,
      passenger_seat_count: null,
      height_metres: null,
      length_metres: null,
      width_metres: null,
      vehicle_category: null,
      gearbox_type: null,
      candidate_id: null,
      candidate_title: null,
      candidate_first_name: null,
      candidate_second_name: null,
      candidate_third_name: null,
      candidate_surname: null,
      candidate_driver_number: null,
      candidate_date_of_birth: null,
      candidate_gender_code: null,
      candidate_ethnicity_code: null,
      cand_primary_tel_ind: null,
      cand_primary_tel: null,
      cand_secondary_tel_ind: null,
      cand_secondary_tel: null,
      cand_mobile_tel_ind: null,
      cand_mobile_tel: null,
      cand_email: null,
      candidate_addr_line1: null,
      candidate_addr_line2: null,
      candidate_addr_line3: null,
      candidate_addr_line4: null,
      candidate_addr_line5: null,
      candidate_post_code: null,
      candidate_prn: null,
      prev_attempts: null,
      business_id: null,
      business_name: null,
      business_addr_line1: null,
      business_addr_line2: null,
      business_addr_line3: null,
      business_addr_line4: null,
      business_addr_line5: null,
      business_post_code: null,
      business_telephone: null,
      cancel_initiator: null,
      examiner_deployed_to_from_code: null,
      cat_ent_check_ind: null,
      integrity_ind: null,
      integrity_case_number: null,
    });
    expect(result).toEqual(
      {
        examinerId: 4,
        testSlot: {
          slotDetail: {
            duration: 57,
            slotId: 1,
            start: '2019-02-12T08:20:00',
          },
          testCentre: {
            centreId: 3,
            centreName: 'testcentre',
            costCode: 'costcentre',
          },
          examinerVisiting: false,
        },
      },
    );
  });

  it('should map a booking with empty or whitespace strings to an ExaminerTestSlot', () => {
    const result = mapRow({
      slot_id: 1,
      start_time: new Date('2019-02-12 08:20:00'),
      minutes: 57,
      vehicle_type_code: null,
      vehicle_slot_type_code: null,
      tc_id: 3,
      tc_cost_centre_code: 'costcentre',
      tc_name: 'testcentre',
      individual_id: 4,
      programme_date: '2019-02-12 00:00:00',
      booking_id: 1111,
      app_id: 2222,
      booking_seq: 333,
      check_digit: 4,
      welsh_test_ind: null,
      ext_req_ind: null,
      progressive_access: null,
      meeting_place: '',
      special_needs: ' ',
      special_needs_extended_test: 1,
      special_needs_code: ' ',
      ent_check_ind: null,
      cab_seat_count: null,
      passenger_seat_count: null,
      height_metres: null,
      length_metres: null,
      width_metres: null,
      vehicle_category: '',
      gearbox_type: 4, // invalid as valid values are 1..3
      candidate_id: 5555,
      candidate_title: '',
      candidate_first_name: ' ',
      candidate_second_name: '',
      candidate_third_name: ' ',
      candidate_surname: '',
      candidate_driver_number: ' ',
      candidate_date_of_birth: null,
      candidate_gender_code: null,
      candidate_ethnicity_code: null,
      cand_primary_tel_ind: 0, // not 1
      cand_primary_tel: '',
      cand_secondary_tel_ind: 2, // not 1
      cand_secondary_tel: ' ',
      cand_mobile_tel_ind: 3, // not 1
      cand_mobile_tel: '',
      cand_email: ' ',
      candidate_addr_line1: '',
      candidate_addr_line2: '  ',
      candidate_addr_line3: '',
      candidate_addr_line4: ' ',
      candidate_addr_line5: '',
      candidate_post_code: ' ',
      candidate_prn: null,
      prev_attempts: null,
      business_id: 6666,
      business_name: '',
      business_addr_line1: '  ',
      business_addr_line2: '',
      business_addr_line3: ' ',
      business_addr_line4: '',
      business_addr_line5: ' ',
      business_post_code: '',
      business_telephone: '  ',
      cancel_initiator: '',
      examiner_deployed_to_from_code: null,
      cat_ent_check_ind: null,
      integrity_ind: 0,
      integrity_case_number: ' ',
    });
    expect(result).toEqual(
      {
        examinerId: 4,
        testSlot: {
          slotDetail: {
            duration: 57,
            slotId: 1,
            start: '2019-02-12T08:20:00',
          },
          testCentre: {
            centreId: 3,
            centreName: 'testcentre',
            costCode: 'costcentre',
          },
          booking: {
            application: {
              applicationId: 2222,
              bookingSequence: 333,
              checkDigit: 4,
              welshTest: false,
              extendedTest: false,
              specialNeedsExtendedTest: true,
              progressiveAccess: false,
              entitlementCheck: false,
              categoryEntitlementCheck: false,
              fitMarker: false,
            },
            candidate: {
              candidateId: 5555,
              candidateName: {
              },
              candidateAddress: {
              },
            },
            business: {
              businessId: 6666,
              businessAddress: {
              },
            },
          },
          examinerVisiting: false,
        },
      },
    );
  });

  it('should map a booking with lower-case candidate details to a capitalised ExaminerTestSlot', () => {
    const result = mapRow({
      slot_id: 1,
      start_time: new Date('2019-02-12 08:20:00'),
      minutes: 57,
      vehicle_type_code: null,
      vehicle_slot_type_code: null,
      tc_id: 3,
      tc_cost_centre_code: 'costcentre',
      tc_name: 'testcentre',
      individual_id: 4,
      programme_date: '2019-02-12 00:00:00',
      booking_id: 1111,
      app_id: 2222,
      booking_seq: 333,
      check_digit: 0,
      welsh_test_ind: null,
      ext_req_ind: null,
      progressive_access: null,
      meeting_place: null,
      special_needs: null,
      special_needs_extended_test: null,
      special_needs_code: null,
      ent_check_ind: null,
      cab_seat_count: null,
      passenger_seat_count: null,
      height_metres: null,
      length_metres: null,
      width_metres: null,
      vehicle_category: null,
      gearbox_type: null,
      candidate_id: 5555,
      candidate_title: 'mr',
      candidate_first_name: 'aaa',
      candidate_second_name: 'bbb',
      candidate_third_name: 'ccc',
      candidate_surname: 'ddd',
      candidate_driver_number: null,
      candidate_date_of_birth: null,
      candidate_gender_code: null,
      candidate_ethnicity_code: null,
      cand_primary_tel_ind: null,
      cand_primary_tel: null,
      cand_secondary_tel_ind: null,
      cand_secondary_tel: null,
      cand_mobile_tel_ind: null,
      cand_mobile_tel: null,
      cand_email: null,
      candidate_addr_line1: null,
      candidate_addr_line2: null,
      candidate_addr_line3: null,
      candidate_addr_line4: null,
      candidate_addr_line5: null,
      candidate_post_code: null,
      candidate_prn: null,
      prev_attempts: null,
      business_id: null,
      business_name: null,
      business_addr_line1: null,
      business_addr_line2: null,
      business_addr_line3: null,
      business_addr_line4: null,
      business_addr_line5: null,
      business_post_code: null,
      business_telephone: null,
      cancel_initiator: null,
      examiner_deployed_to_from_code: null,
      cat_ent_check_ind: 1,
      integrity_ind: 0,
      integrity_case_number: null,
    });
    expect(result).toEqual(
      {
        examinerId: 4,
        testSlot: {
          slotDetail: {
            duration: 57,
            slotId: 1,
            start: '2019-02-12T08:20:00',
          },
          testCentre: {
            centreId: 3,
            centreName: 'testcentre',
            costCode: 'costcentre',
          },
          booking: {
            application: {
              applicationId: 2222,
              bookingSequence: 333,
              checkDigit: 0,
              welshTest: false,
              specialNeedsExtendedTest: false,
              extendedTest: false,
              progressiveAccess: false,
              entitlementCheck: false,
              categoryEntitlementCheck: true,
              fitMarker: false,
            },
            candidate: {
              candidateId: 5555,
              candidateName: {
                title: 'Mr',
                firstName: 'Aaa',
                secondName: 'Bbb',
                thirdName: 'Ccc',
                lastName: 'Ddd',
              },
              candidateAddress: {
              },
            },
          },
          examinerVisiting: false,
        },
      },
    );
  });
});
