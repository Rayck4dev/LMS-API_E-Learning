export interface EnrollmentStrategy {
  processEnrollment(
    userId: string,
    courseId: string,
  ): Promise<{ status: string; message: string }>;
}
