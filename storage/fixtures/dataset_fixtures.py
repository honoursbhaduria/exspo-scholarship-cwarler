from datetime import date, timedelta

# Dynamically calculate dates relative to today so expired and expiring soon scenarios always evaluate accurately!
TODAY = date.today()
EXPIRED_DATE = (TODAY - timedelta(days=20)).strftime("%d %B %Y")
EXPIRING_SOON_DATE = (TODAY + timedelta(days=4)).strftime("%d %B %Y")
ACTIVE_FUTURE_DATE_1 = (TODAY + timedelta(days=45)).strftime("%d %B %Y")
ACTIVE_FUTURE_DATE_2 = (TODAY + timedelta(days=75)).strftime("%d %B %Y")

SCHOLARSHIP_FIXTURES = {
    # 1. Government - National Scholarship Portal Central Sector
    "https://scholarships.gov.in/schemes/central-sector": f"""
    <!DOCTYPE html>
    <html>
    <head><title>Central Sector Scheme of Scholarships for College and University Students</title></head>
    <body>
    <header><nav>Home | Schemes | Contact</nav></header>
    <main>
        <h1>Central Sector Scheme of Scholarships for College and University Students</h1>
        <p>Offered by Ministry of Education (Government of India)</p>
        <section class="overview">
            <p>The scheme provides financial assistance of Rs. 20,000 per annum to meritorious students from low-income families.</p>
        </section>
        <section class="eligibility">
            <h2>Eligibility Criteria</h2>
            <p>Applicant must be an Indian citizen who has scored above 80th percentile in relevant stream in Class 12 board examination.</p>
            <p>Total family income should not exceed 4,50,000 per annum from all sources.</p>
            <p>Applicant must not be in receipt of any other centrally sponsored scholarship.</p>
        </section>
        <section class="dates">
            <p>The portal opens on 1st July 2026.</p>
            <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        </section>
        <section class="process">
            <p>Selection process: Allocation of scholarship is based on state-wise quota and Class 12 percentile marks.</p>
            <p>Renewal criteria: Continuation of scholarship requires obtaining at least 50% marks in annual examination and 75% attendance.</p>
            <p>Apply online at https://scholarships.gov.in/apply-central-sector</p>
        </section>
        <section class="documents">
            <p>Mandatory documents: Aadhaar Card, Income Certificate, Mark Sheet, Bank Passbook</p>
        </section>
    </main>
    <footer>Copyright 2026 Ministry of Education</footer>
    </body>
    </html>
    """,

    # 2. Government - National Overseas Scholarship
    "https://nosmsje.gov.in/schemes/national-overseas-scholarship": f"""
    <!DOCTYPE html>
    <html>
    <head><title>National Overseas Scholarship Scheme for SC/ST Candidates</title></head>
    <body>
    <main>
        <h1>National Overseas Scholarship Scheme</h1>
        <p>Offered by Ministry of Social Justice and Empowerment</p>
        <p>Provides financial assistance of Rs. 15,00,000 per annum towards tuition fees and living expenses for Master and Ph.D. abroad.</p>
        <h2>Eligibility Conditions</h2>
        <p>Candidate must be an Indian citizen belonging to SC, ST, or Landless Agricultural Labourer category.</p>
        <p>Candidate must have secured minimum 60% marks in qualifying degree.</p>
        <p>Total family income should not exceed 8,00,000 per annum.</p>
        <p>Closing date for submission is {ACTIVE_FUTURE_DATE_2}.</p>
        <p>Apply online at https://nosmsje.gov.in/apply-online</p>
        <p>Documents required: Caste Certificate, Income Certificate, Aadhaar Card, Passport size photograph, Mark Sheet</p>
    </main>
    </body>
    </html>
    """,

    # 3. Government - AICTE Pragati Scholarship for Girls
    "https://www.aicte-india.org/schemes/students-development-schemes/pragati": f"""
    <!DOCTYPE html>
    <html>
    <head><title>AICTE Pragati Scholarship Scheme for Girl Students</title></head>
    <body>
    <main>
        <h1>AICTE Pragati Scholarship Scheme for Girl Students</h1>
        <p>Provided by All India Council for Technical Education (AICTE)</p>
        <p>Amount: Provides an award of Rs. 50,000 per annum for every year of study towards college fee and equipment.</p>
        <h2>Eligibility Guidelines</h2>
        <p>Only female girl students admitted to first year of Degree/Diploma program in an AICTE approved institution.</p>
        <p>Family income should not exceed 8,00,000 per annum.</p>
        <p>Maximum two girl children per family are eligible.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://www.aicte-india.org/apply-pragati</p>
        <p>Documents: Admission Letter, Income Certificate, Mark Sheet, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 4. Government - DST INSPIRE SHE Fellowship
    "https://online-inspire.gov.in/she-fellowship": f"""
    <!DOCTYPE html>
    <html>
    <head><title>Innovation in Science Pursuit for Inspired Research (INSPIRE) - SHE</title></head>
    <body>
    <main>
        <h1>INSPIRE Scholarship for Higher Education (SHE)</h1>
        <p>Offered by Department of Science and Technology (DST)</p>
        <p>Scholarship grant of Rs. 80,000 per annum for students pursuing B.Sc., B.S., and Int. M.Sc. in Natural and Basic Sciences.</p>
        <p>Eligibility: Students ranking within top 1% in Class 12 board examination or rank holders in JEE/NEET.</p>
        <p>Candidate must be a citizen of India.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_2}.</p>
        <p>Apply online at https://online-inspire.gov.in/apply-she</p>
        <p>Documents: Mark Sheet, Bonafide Certificate, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 5. Government - UGC Ishan Uday Special Scholarship for North Eastern Region
    "https://ugc.ac.in/schemes/ishan-uday-special-scholarship": f"""
    <!DOCTYPE html>
    <html>
    <head><title>UGC Ishan Uday Special Scholarship Scheme for NER</title></head>
    <body>
    <main>
        <h1>Ishan Uday Special Scholarship Scheme</h1>
        <p>Provided by University Grants Commission (UGC)</p>
        <p>Financial assistance of Rs. 7,800 per month (approx Rs. 93,600 per year) for degree technical courses.</p>
        <p>Eligibility: Students with domicile of North Eastern Region (NER) who passed Class 12.</p>
        <p>Family income should not exceed 4,50,000 per annum.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://scholarships.gov.in/ugc-ishan-uday</p>
        <p>Documents: Domicile Certificate, Income Certificate, Mark Sheet, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 6. Government - Ministry of Tribal Affairs National Fellowship
    "https://tribal.nic.in/schemes/national-fellowship-st": f"""
    <!DOCTYPE html>
    <html>
    <head><title>National Fellowship and Scholarship for Higher Education of ST Students</title></head>
    <body>
    <main>
        <h1>National Fellowship for Higher Education of ST Students</h1>
        <p>Provided by Ministry of Tribal Affairs</p>
        <p>Financial assistance of Rs. 31,000 per month plus contingency for M.Phil and Ph.D. scholars.</p>
        <p>Eligibility: Must belong to Scheduled Tribe (ST) category and have secured admission in regular M.Phil/Ph.D.</p>
        <p>Family income should not exceed 6,00,000 per annum.</p>
        <p>Closing date for submission is {ACTIVE_FUTURE_DATE_2}.</p>
        <p>Apply online at https://tribal.nic.in/fellowship/apply</p>
        <p>Documents: Caste Certificate, Income Certificate, Mark Sheet, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 7. University - IIT Bombay Merit-cum-Means
    "https://www.iitb.ac.in/academics/financial-aid/merit-cum-means": f"""
    <!DOCTYPE html>
    <html>
    <head><title>IIT Bombay Merit-cum-Means Scholarship</title></head>
    <body>
    <main>
        <h1>IIT Bombay Merit-cum-Means Scholarship</h1>
        <p>Offered by Indian Institute of Technology Bombay</p>
        <p>Amount: Full tuition fee waiver plus allowance of Rs. 40,000 per annum.</p>
        <h2>Eligibility Criteria</h2>
        <p>Undergraduate engineering students at IIT Bombay with minimum 6.75 CPI.</p>
        <p>Family income should not exceed 5,00,000 per annum.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://asc.iitb.ac.in/apply-mcm</p>
        <p>Documents: Income Certificate, Mark Sheet, Bank Passbook, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 8. University - University of Delhi VC Student Fund
    "https://www.du.ac.in/students/vice-chancellor-student-fund": f"""
    <!DOCTYPE html>
    <html>
    <head><title>University of Delhi Vice Chancellor Student Fund</title></head>
    <body>
    <main>
        <h1>Vice Chancellor Student Fund Scheme</h1>
        <p>Provided by University of Delhi</p>
        <p>Provides financial grant of Rs. 25,000 per annum to needy regular undergraduate students.</p>
        <p>Eligibility: Students enrolled in constituent colleges of DU with at least 60% marks in previous year.</p>
        <p>Family income should not exceed 4,00,000 per annum.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://du.ac.in/student-fund/apply</p>
        <p>Documents: Income Certificate, Bonafide Certificate, Mark Sheet, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 9. University - IISc Research Support
    "https://iisc.ac.in/admissions/financial-support-research": f"""
    <!DOCTYPE html>
    <html>
    <head><title>IISc Research Students Financial Support Scheme</title></head>
    <body>
    <main>
        <h1>IISc Research Fellowship Program</h1>
        <p>Provided by Indian Institute of Science Bangalore</p>
        <p>Financial stipend of Rs. 37,000 per month for enrolled doctoral research scholars.</p>
        <p>Eligibility: Candidates admitted to Ph.D. program through GATE or CSIR-UGC NET.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_2}.</p>
        <p>Apply online at https://admissions.iisc.ac.in/portal/apply</p>
        <p>Documents: Mark Sheet, Admission Letter, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 10. University - Anna University Merit Assistance
    "https://www.annauniv.edu/scholarships/merit-student-assistance": f"""
    <!DOCTYPE html>
    <html>
    <head><title>Anna University Student Merit-cum-Means Assistance</title></head>
    <body>
    <main>
        <h1>Anna University Student Merit Assistance</h1>
        <p>Provided by Anna University Chennai</p>
        <p>Financial assistance of Rs. 30,000 per annum to deserving engineering students.</p>
        <p>Eligibility: Regular B.E./B.Tech students with minimum 7.0 CGPA.</p>
        <p>Family income should not exceed 3,00,000 per annum.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://www.annauniv.edu/scholarship/apply</p>
        <p>Documents: Income Certificate, Mark Sheet, Bank Passbook, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 11. University - JNU MCM Scheme
    "https://www.jnu.ac.in/fellowships/mcm-merit-scheme": f"""
    <!DOCTYPE html>
    <html>
    <head><title>Jawaharlal Nehru University Merit-cum-Means Scheme</title></head>
    <body>
    <main>
        <h1>JNU Merit-cum-Means Financial Support</h1>
        <p>Provided by Jawaharlal Nehru University</p>
        <p>Amount: Monthly fellowship of Rs. 2,000 per month (Rs. 24,000 per annum).</p>
        <p>Eligibility: Regular students of Master and Bachelor programs at JNU.</p>
        <p>Family income should not exceed 2,50,000 per annum.</p>
        <p>Closing date for submission is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://jnu.ac.in/mcm/apply</p>
        <p>Documents: Income Certificate, Mark Sheet, Bonafide Certificate</p>
    </main>
    </body>
    </html>
    """,

    # 12. University - IIT Delhi Free Studentship
    "https://home.iitd.ac.in/financial-assistance/free-studentship": f"""
    <!DOCTYPE html>
    <html>
    <head><title>IIT Delhi Free Studentship and Merit Assistance</title></head>
    <body>
    <main>
        <h1>IIT Delhi Free Studentship Scheme</h1>
        <p>Provided by Indian Institute of Technology Delhi</p>
        <p>Complete tuition fee waiver and grant of Rs. 35,000 per year.</p>
        <p>Eligibility: B.Tech and Dual Degree students with CGPA not less than 6.0.</p>
        <p>Family income should not exceed 5,00,000 per annum.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_2}.</p>
        <p>Apply online at https://home.iitd.ac.in/apply-studentship</p>
        <p>Documents: Income Certificate, Mark Sheet, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 13. Corporate - Tata Capital Pankh Scholarship
    "https://www.tatacapital.com/csr/pankh-scholarship-program": f"""
    <!DOCTYPE html>
    <html>
    <head><title>Tata Capital Pankh Scholarship Program 2026-27</title></head>
    <body>
    <main>
        <h1>Tata Capital Pankh Scholarship Program</h1>
        <p>Initiated by Tata Capital Limited (CSR)</p>
        <p>Provides financial grant of Rs. 50,000 for undergraduate and vocational studies.</p>
        <h2>Eligibility Criteria</h2>
        <p>Students studying in professional degree courses scoring at least 60% marks in Class 12.</p>
        <p>Family income should not exceed 2,50,000 per annum.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://www.tatacapital.com/apply-pankh</p>
        <p>Documents: Aadhaar Card, Income Certificate, Mark Sheet, Bank Passbook, Admission Letter</p>
    </main>
    </body>
    </html>
    """,

    # 14. Corporate - HDFC Bank Parivartan Badhte Kadam
    "https://www.hdfcbank.com/parivartan/badhte-kadam-scholarship": f"""
    <!DOCTYPE html>
    <html>
    <head><title>HDFC Bank Parivartan Badhte Kadam Scholarship</title></head>
    <body>
    <main>
        <h1>HDFC Bank Parivartan Badhte Kadam Scholarship</h1>
        <p>Offered by HDFC Bank Parivartan</p>
        <p>Financial assistance of Rs. 75,000 to students facing critical financial crisis.</p>
        <p>Eligibility: Students pursuing general graduation or professional degrees with min 55% marks.</p>
        <p>Annual income should not exceed 6,00,000 per annum.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://www.hdfcbank.com/badhte-kadam/apply</p>
        <p>Documents: Income Certificate, Mark Sheet, Aadhaar Card, Bank Passbook</p>
    </main>
    </body>
    </html>
    """,

    # 15. Corporate - Reliance Foundation Undergraduate Scholarship
    "https://www.reliancefoundation.org/undergraduate-scholarships": f"""
    <!DOCTYPE html>
    <html>
    <head><title>Reliance Foundation Undergraduate Scholarship 2026-27</title></head>
    <body>
    <main>
        <h1>Reliance Foundation Undergraduate Scholarship</h1>
        <p>Offered by Reliance Foundation</p>
        <p>Grant of up to Rs. 2,00,000 over the course of the undergraduate degree.</p>
        <h2>Eligibility</h2>
        <p>Resident Indian students enrolled in 1st year full-time undergraduate degree program.</p>
        <p>Must have scored at least 60% marks in Class 12 examination.</p>
        <p>Household income should not exceed 15,00,000 per annum (preference given to < 2.5 lakh).</p>
        <p>Closing date for application is {ACTIVE_FUTURE_DATE_2}.</p>
        <p>Apply online at https://www.reliancefoundation.org/scholarships/apply</p>
        <p>Documents: Mark Sheet, Income Certificate, Aadhaar Card, Bonafide Certificate</p>
    </main>
    </body>
    </html>
    """,

    # 16. Corporate - Aditya Birla Scholarship Programme
    "https://www.adityabirlascholars.net/scholarship-programme": f"""
    <!DOCTYPE html>
    <html>
    <head><title>The Aditya Birla Scholarship Programme</title></head>
    <body>
    <main>
        <h1>The Aditya Birla Scholarship Programme</h1>
        <p>Offered by Aditya Birla Group</p>
        <p>Substantial award of Rs. 1,75,000 per annum for engineering and management scholars.</p>
        <p>Eligibility: Top-ranked students admitted to premier institutes (IITs, BITS Pilani, IIMs, XLRI).</p>
        <p>Selection process: Evaluation of leadership essays, academic track record, and final interview by esteemed panel.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://www.adityabirlascholars.net/apply-now</p>
        <p>Documents: Mark Sheet, Admission Letter, Passport size photograph</p>
    </main>
    </body>
    </html>
    """,

    # 17. Corporate - Infosys STEM Stars Scholarship
    "https://www.infosys.org/stem-stars-scholarship": f"""
    <!DOCTYPE html>
    <html>
    <head><title>Infosys STEM Stars Scholarship for Women</title></head>
    <body>
    <main>
        <h1>Infosys STEM Stars Scholarship</h1>
        <p>Sponsored by Infosys Foundation</p>
        <p>Amount: Comprehensive assistance of Rs. 1,00,000 per year covering tuition and study materials.</p>
        <p>Eligibility: Female girl students admitted to first year of undergraduate STEM courses at NIRF ranked institutes.</p>
        <p>Family income should not exceed 8,00,000 per annum.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_2}.</p>
        <p>Apply online at https://www.infosys.org/stem-stars/apply</p>
        <p>Documents: Mark Sheet, Income Certificate, Aadhaar Card, Admission Letter</p>
    </main>
    </body>
    </html>
    """,

    # 18. Corporate - SBI Asha Scholarship Program
    "https://www.sbifoundation.in/asha-scholarship-initiative": f"""
    <!DOCTYPE html>
    <html>
    <head><title>SBI Asha Scholarship Program</title></head>
    <body>
    <main>
        <h1>SBI Asha Scholarship Program</h1>
        <p>Offered by SBI Foundation</p>
        <p>Financial support of Rs. 50,000 for undergraduate students from underprivileged backgrounds.</p>
        <p>Eligibility: Students with minimum 75% marks in previous class.</p>
        <p>Annual family income should not exceed 3,00,000 per annum.</p>
        <p>Closing date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://www.sbifoundation.in/apply-asha</p>
        <p>Documents: Mark Sheet, Income Certificate, Aadhaar Card, Bank Passbook</p>
    </main>
    </body>
    </html>
    """,

    # 19. Foundation - Tata Trusts Means Grant
    "https://www.tatatrusts.org/grants-education/means-grant": f"""
    <!DOCTYPE html>
    <html>
    <head><title>Tata Trusts Means Grant for College Students</title></head>
    <body>
    <main>
        <h1>Tata Trusts Education Means Grant</h1>
        <p>Offered by Tata Trusts</p>
        <p>Need-based assistance of Rs. 60,000 towards college tuition fees.</p>
        <p>Eligibility: Indian students studying in Mumbai and suburbs or recognised colleges with at least 60% marks.</p>
        <p>Family income should not exceed 4,00,000 per annum.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://www.tatatrusts.org/apply-grant</p>
        <p>Documents: Mark Sheet, Income Certificate, Aadhaar Card, Fee Receipt</p>
    </main>
    </body>
    </html>
    """,

    # 20. Foundation - Azim Premji Fellowship & Scholarship
    "https://azimpremjifoundation.org/fellowship-scholarship": f"""
    <!DOCTYPE html>
    <html>
    <head><title>Azim Premji Scholarship for Girls in Higher Education</title></head>
    <body>
    <main>
        <h1>Azim Premji Scholarship Scheme</h1>
        <p>Offered by Azim Premji Foundation</p>
        <p>Financial assistance of Rs. 30,000 per year for undergraduate studies in government colleges.</p>
        <p>Eligibility: Girl students who completed Class 12 from government schools.</p>
        <p>Family income should not exceed 2,00,000 per annum.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_2}.</p>
        <p>Apply online at https://azimpremjifoundation.org/apply-scholarship</p>
        <p>Documents: Mark Sheet, Income Certificate, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 21. Foundation - K.C. Mahindra Education Trust Postgraduate Grant
    "https://www.kcmet.org/scholarships/mahindra-postgraduate-grants": f"""
    <!DOCTYPE html>
    <html>
    <head><title>K.C. Mahindra Scholarships for Postgraduate Studies Abroad</title></head>
    <body>
    <main>
        <h1>K.C. Mahindra Postgraduate Scholarship</h1>
        <p>Offered by K.C. Mahindra Education Trust</p>
        <p>Prestigious interest-free loan scholarship of Rs. 10,00,000 for postgraduate studies overseas.</p>
        <p>Eligibility: First class degree from a recognised Indian university with admission abroad.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://www.kcmet.org/apply-postgraduate</p>
        <p>Documents: Mark Sheet, Admission Letter, Aadhaar Card, Passport size photograph</p>
    </main>
    </body>
    </html>
    """,

    # 22. EXPIRED EXAMPLE - Past Deadline (Assignment Requirement: 2+ expired/stale)
    "https://scholarships.gov.in/schemes/pre-matric-disabilities": f"""
    <!DOCTYPE html>
    <html>
    <head><title>Pre-Matric Scholarship for Students with Disabilities</title></head>
    <body>
    <main>
        <h1>Pre-Matric Scholarship for Students with Disabilities</h1>
        <p>Offered by Department of Empowerment of Persons with Disabilities</p>
        <p>Maintenance allowance of Rs. 15,000 per annum.</p>
        <p>Eligibility: Students with more than 40% disability.</p>
        <p>Family income should not exceed 2,50,000 per annum.</p>
        <p>Closing date for application is {EXPIRED_DATE}. Applications are closed for this cycle.</p>
        <p>Apply online at https://scholarships.gov.in/apply-pwd</p>
        <p>Documents: Disability Certificate, Income Certificate, Mark Sheet, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 23. EXPIRING SOON EXAMPLE - Deadline in 4 days (Assignment Requirement: 2+ expired/stale)
    "https://www.aicte-india.org/schemes/students-development-schemes/saksham": f"""
    <!DOCTYPE html>
    <html>
    <head><title>AICTE Saksham Scholarship Scheme for Specially Abled</title></head>
    <body>
    <main>
        <h1>AICTE Saksham Scholarship Scheme</h1>
        <p>Offered by All India Council for Technical Education (AICTE)</p>
        <p>Grant of Rs. 50,000 per annum for technical education.</p>
        <p>Eligibility: Specially abled student having disability not less than 40%.</p>
        <p>Family income should not exceed 8,00,000 per annum.</p>
        <p>Last date for application is {EXPIRING_SOON_DATE}. Urgent: Portal closes this week!</p>
        <p>Apply online at https://www.aicte-india.org/apply-saksham</p>
        <p>Documents: Disability Certificate, Mark Sheet, Income Certificate, Aadhaar Card</p>
    </main>
    </body>
    </html>
    """,

    # 24. AGGREGATOR / REVIEW REQUIRED EXAMPLE (Assignment Requirement: review required / anti-aggregator hard gate)
    "https://www.buddy4study.com/scholarship/unverified-forum-opportunity": f"""
    <!DOCTYPE html>
    <html>
    <head><title>Community Shared Scholarship Opportunity</title></head>
    <body>
    <main>
        <h1>Community Student Financial Assistance Scheme</h1>
        <p>Shared on Buddy4Study Aggregator Forum</p>
        <p>Reported financial grant of Rs. 10,000 for college students.</p>
        <p>Eligibility: Open to all Indian students.</p>
        <p>Last date for application is {ACTIVE_FUTURE_DATE_1}.</p>
        <p>Apply online at https://third-party-blog.info/submit</p>
    </main>
    </body>
    </html>
    """
}
