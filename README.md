# CareerOS

FastAPI backend with JSON persistence.

## Run

1) Install dependencies:

   pip install -r requirements.txt

2) Start the server:

   uvicorn app.main:app --reload

## Endpoints

- GET /health
- POST /submit-task
- POST /analyze-profile
- POST /analyze-role

## Scripts

### Process LinkedIn Dataset

Extract skill demand frequency from LinkedIn Job Postings dataset:

```bash
python scripts/process_linkedin_dataset.py <input_csv> [--output <output_json>]
```

Example:

```bash
python scripts/process_linkedin_dataset.py data/linkedin_jobs.csv
```

Output: `app/data/market_skills.json`
