export interface ExaminerQueryRecord {
  individual_id: number;
  staff_number: string;
  test_centre_manager_ind: number | null;
  test_category_ref: string | null;
  with_effect_from: Date | null;
  with_effect_to: Date | null;
}
