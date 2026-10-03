import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import uuid
from core.models import SessionLocal, Source

SOURCES_DATA = [
    # GOVERNMENT
    {
        "domain": "scholarships.gov.in",
        "base_url": "https://scholarships.gov.in/schemes/central-sector",
        "provider_name": "Ministry of Education (Government of India)",
        "source_type": "GOVERNMENT",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 12,
    },
    {
        "domain": "nosmsje.gov.in",
        "base_url": "https://nosmsje.gov.in/schemes/national-overseas-scholarship",
        "provider_name": "Ministry of Social Justice and Empowerment",
        "source_type": "GOVERNMENT",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 24,
    },
    {
        "domain": "aicte-india.org",
        "base_url": "https://www.aicte-india.org/schemes/students-development-schemes/pragati",
        "provider_name": "All India Council for Technical Education (AICTE)",
        "source_type": "GOVERNMENT",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 24,
    },
    {
        "domain": "dst.gov.in",
        "base_url": "https://online-inspire.gov.in/she-fellowship",
        "provider_name": "Department of Science and Technology (DST)",
        "source_type": "GOVERNMENT",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 48,
    },
    {
        "domain": "ugc.ac.in",
        "base_url": "https://ugc.ac.in/schemes/ishan-uday-special-scholarship",
        "provider_name": "University Grants Commission (UGC)",
        "source_type": "GOVERNMENT",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 24,
    },
    {
        "domain": "tribal.nic.in",
        "base_url": "https://tribal.nic.in/schemes/national-fellowship-st",
        "provider_name": "Ministry of Tribal Affairs",
        "source_type": "GOVERNMENT",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 48,
    },

    # UNIVERSITY
    {
        "domain": "iitb.ac.in",
        "base_url": "https://www.iitb.ac.in/academics/financial-aid/merit-cum-means",
        "provider_name": "Indian Institute of Technology Bombay",
        "source_type": "UNIVERSITY",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 48,
    },
    {
        "domain": "du.ac.in",
        "base_url": "https://www.du.ac.in/students/vice-chancellor-student-fund",
        "provider_name": "University of Delhi",
        "source_type": "UNIVERSITY",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 48,
    },
    {
        "domain": "iisc.ac.in",
        "base_url": "https://iisc.ac.in/admissions/financial-support-research",
        "provider_name": "Indian Institute of Science Bangalore",
        "source_type": "UNIVERSITY",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 48,
    },
    {
        "domain": "annauniv.edu",
        "base_url": "https://www.annauniv.edu/scholarships/merit-student-assistance",
        "provider_name": "Anna University Chennai",
        "source_type": "UNIVERSITY",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 48,
    },
    {
        "domain": "jnu.ac.in",
        "base_url": "https://www.jnu.ac.in/fellowships/mcm-merit-scheme",
        "provider_name": "Jawaharlal Nehru University",
        "source_type": "UNIVERSITY",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 48,
    },
    {
        "domain": "iitd.ac.in",
        "base_url": "https://home.iitd.ac.in/financial-assistance/free-studentship",
        "provider_name": "Indian Institute of Technology Delhi",
        "source_type": "UNIVERSITY",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 48,
    },

    # CORPORATE
    {
        "domain": "tatacapital.com",
        "base_url": "https://www.tatacapital.com/csr/pankh-scholarship-program",
        "provider_name": "Tata Capital Limited (CSR)",
        "source_type": "CORPORATE",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 24,
    },
    {
        "domain": "hdfcbank.com",
        "base_url": "https://www.hdfcbank.com/parivartan/badhte-kadam-scholarship",
        "provider_name": "HDFC Bank Parivartan",
        "source_type": "CORPORATE",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 24,
    },
    {
        "domain": "reliancefoundation.org",
        "base_url": "https://www.reliancefoundation.org/undergraduate-scholarships",
        "provider_name": "Reliance Foundation",
        "source_type": "CORPORATE",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 24,
    },
    {
        "domain": "adityabirlascholars.net",
        "base_url": "https://www.adityabirlascholars.net/scholarship-programme",
        "provider_name": "Aditya Birla Group",
        "source_type": "CORPORATE",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 48,
    },
    {
        "domain": "infosys.com",
        "base_url": "https://www.infosys.org/stem-stars-scholarship",
        "provider_name": "Infosys Foundation",
        "source_type": "CORPORATE",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 24,
    },
    {
        "domain": "sbifoundation.in",
        "base_url": "https://www.sbifoundation.in/asha-scholarship-initiative",
        "provider_name": "SBI Foundation",
        "source_type": "CORPORATE",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 24,
    },

    # FOUNDATION / TRUST
    {
        "domain": "tatatrusts.org",
        "base_url": "https://www.tatatrusts.org/grants-education/means-grant",
        "provider_name": "Tata Trusts",
        "source_type": "FOUNDATION",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 24,
    },
    {
        "domain": "azimpremjifoundation.org",
        "base_url": "https://azimpremjifoundation.org/fellowship-scholarship",
        "provider_name": "Azim Premji Foundation",
        "source_type": "FOUNDATION",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 48,
    },
    {
        "domain": "kcmet.org",
        "base_url": "https://www.kcmet.org/scholarships/mahindra-postgraduate-grants",
        "provider_name": "K.C. Mahindra Education Trust",
        "source_type": "FOUNDATION",
        "trust_level": "OFFICIAL_PRIMARY",
        "crawl_frequency_hours": 48,
    },

    # AGGREGATOR (Used to test discovery & anti-aggregator hard gate)
    {
        "domain": "buddy4study.com",
        "base_url": "https://www.buddy4study.com/scholarship/unverified-forum-opportunity",
        "provider_name": "Third-Party Aggregator Portal",
        "source_type": "AGGREGATOR",
        "trust_level": "UNTRUSTED_DISCOVERY",
        "crawl_frequency_hours": 12,
    },
]

def seed():
    db = SessionLocal()
    try:
        created = 0
        updated = 0
        for s in SOURCES_DATA:
            existing = db.query(Source).filter(Source.domain == s["domain"]).first()
            if not existing:
                src = Source(**s)
                db.add(src)
                created += 1
            else:
                for k, v in s.items():
                    setattr(existing, k, v)
                updated += 1
        db.commit()
        print(f"Sources Seeding Complete: {created} created, {updated} updated (Total: {len(SOURCES_DATA)})")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
