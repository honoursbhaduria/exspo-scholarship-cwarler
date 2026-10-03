export interface Scholarship {
  id: string;
  canonical_key: string;
  name: string;
  provider: string;
  source_type: string;
  amount: number | null;
  currency: string;
  benefit_description: string | null;
  opening_date: string | null;
  closing_date: string | null;
  official_source_url: string;
  application_url: string | null;
  status: 'VERIFIED' | 'EXTRACTED' | 'REVIEW_REQUIRED' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_LONGER_VERIFIABLE';
  confidence_score: number;
  last_verified_at: string;
}

export interface ScholarshipDetail extends Scholarship {
  eligibility_json: {
    all_of?: any[];
    any_of?: any[];
    raw_text?: string;
  };
  academic_requirements: string[];
  income_limit: number | null;
  age_criteria?: any;
  gender_criteria?: string;
  category_criteria: string[];
  domicile_requirements: string[];
  documents_required: string[];
  selection_process: string | null;
  renewal_requirements: string | null;
  confidence_breakdown: Record<string, { score: number; max: number; reason: string }>;
  first_discovered_at: string;
  last_changed_at: string;
}

export interface EvidenceItem {
  id: string;
  field_name: string;
  extracted_value: string;
  quote: string;
  char_start: number | null;
  char_end: number | null;
  dom_selector: string | null;
  snapshot_hash: string;
  extracted_at: string;
}

export interface VersionItem {
  id: string;
  version_number: number;
  payload_json: Record<string, any>;
  content_hash: string;
  valid_from: string;
  valid_until: string | null;
}

export interface ChangeEvent {
  id: string;
  scholarship_id: string;
  scholarship_name: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  detected_at: string;
}

export interface Metrics {
  total_discovered: number;
  verified_count: number;
  review_required_count: number;
  active_count: number;
  expiring_soon_count: number;
  expired_count: number;
  average_confidence: number;
  total_sources: number;
  total_changes_detected: number;
}

export interface ReviewItem {
  id: string;
  scholarship_id: string;
  scholarship_name: string;
  provider: string;
  official_source_url: string;
  confidence_score: number;
  reason: string;
  details: Record<string, any>;
  status: string;
  created_at: string;
}

export interface CrawlRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  pages_discovered: number;
  pages_crawled: number;
  records_extracted: number;
  records_verified: number;
  review_required: number;
  changes_detected: number;
  error_count: number;
}
