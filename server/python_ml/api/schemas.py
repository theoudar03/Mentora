from pydantic import BaseModel

class StudentFeatures(BaseModel):
    family_support_score: float
    fee_payment_score: float
    perceived_stress_score: float
    anxiety_score: float
    sleep_quality_score: float
    loneliness_score: float
    academic_pressure_score: float
    screen_time_score: float
    campus_belonging_score: float
    cgpa_score: float
    attendance_score: float
