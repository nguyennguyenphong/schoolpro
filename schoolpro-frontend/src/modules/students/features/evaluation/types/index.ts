export interface EvaluationCriteria {
  id: string;
  category: string;
  title: string;
  maxScore: number;
  selfScore?: number;
  facultyScore?: number;
}
