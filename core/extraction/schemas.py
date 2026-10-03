from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class FieldWithEvidence(BaseModel):
    value: Optional[Any] = None
    raw_value: Optional[str] = None
    evidence_quote: Optional[str] = Field(None, description="Verbatim quote from source text")

class StructuredEligibilityAST(BaseModel):
    all_of: List[Dict[str, Any]] = Field(default_factory=list)
    any_of: List[Dict[str, Any]] = Field(default_factory=list)
    raw_text: str = ""

class ExtractedScholarshipData(BaseModel):
    name: FieldWithEvidence
    provider: FieldWithEvidence
    amount: Optional[FieldWithEvidence] = None
    currency: str = "INR"
    benefit_description: Optional[FieldWithEvidence] = None
    opening_date: Optional[FieldWithEvidence] = None
    closing_date: Optional[FieldWithEvidence] = None
    application_url: Optional[FieldWithEvidence] = None
    income_limit: Optional[FieldWithEvidence] = None
    eligibility: StructuredEligibilityAST = Field(default_factory=StructuredEligibilityAST)
    academic_requirements: List[str] = Field(default_factory=list)
    age_criteria: Optional[Dict[str, Any]] = None
    gender_criteria: Optional[str] = "ALL"
    category_criteria: List[str] = Field(default_factory=list)
    domicile_requirements: List[str] = Field(default_factory=list)
    documents_required: List[str] = Field(default_factory=list)
    selection_process: Optional[FieldWithEvidence] = None
    renewal_requirements: Optional[FieldWithEvidence] = None
