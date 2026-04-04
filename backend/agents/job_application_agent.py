"""
AI Job Application Agent — Real Implementation
Uses Groq LLM for AI-powered job discovery, scoring, and resume parsing.
Strategy: AI generates hyper-relevant jobs for the user's exact role+location,
supplemented by real API scraping where available.
"""

import asyncio
import re
import json
import os
from datetime import datetime, timezone, timedelta
from typing import List, Dict
import uuid
import logging
import requests
from openai import OpenAI

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = "llama-3.3-70b-versatile"


def get_groq_client():
    if not GROQ_API_KEY:
        return None
    return OpenAI(api_key=GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")


class JobApplicationAgent:
    def __init__(self, db, **kwargs):
        self.db = db
        self.llm = get_groq_client()
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                          "AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        }

    # ─── AI HELPERS ───────────────────────────────────────────

    def _ask_llm(self, system: str, user: str, json_mode: bool = False) -> str:
        if not self.llm:
            return ""
        try:
            kwargs = {
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user}
                ],
                "temperature": 0.4,
                "max_tokens": 3000,
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}
            resp = self.llm.chat.completions.create(**kwargs)
            return resp.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Groq LLM error: {e}")
            return ""

    async def _ask_llm_async(self, system: str, user: str, json_mode: bool = False) -> str:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._ask_llm, system, user, json_mode)

    # ─── RESUME PARSING ──────────────────────────────────────

    async def parse_resume(self, resume_text: str) -> Dict:
        system = """You are a resume parser. Extract structured data.
Return JSON: {"skills":["list"],"total_years":number,"current_role":"string",
"education":["list"],"achievements":["top 3"],"summary":"2 sentences"}"""
        raw = await self._ask_llm_async(system, resume_text[:4000], json_mode=True)
        if raw:
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                pass
        skills = self._extract_skills(resume_text)
        return {"skills": skills, "total_years": self._extract_years(resume_text),
                "current_role": "", "education": [], "achievements": [], "summary": ""}

    def _extract_skills(self, text: str) -> List[str]:
        patterns = [
            r'\b(Python|Java|JavaScript|TypeScript|React|Next\.?js|Node\.?js|Angular|Vue|Go|Rust|C\+\+|C#|Ruby|PHP|Swift|Kotlin)\b',
            r'\b(AWS|Azure|GCP|Docker|Kubernetes|Terraform|Jenkins|CI/CD|GitHub Actions)\b',
            r'\b(MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|DynamoDB)\b',
            r'\b(Machine Learning|Deep Learning|NLP|TensorFlow|PyTorch)\b',
            r'\b(REST|GraphQL|Microservices|System Design|Kafka|RabbitMQ)\b',
        ]
        skills = set()
        for p in patterns:
            for m in re.findall(p, text, re.IGNORECASE):
                skills.add(m)
        return list(skills)

    def _extract_years(self, text: str) -> int:
        m = re.search(r'(\d+)\+?\s*years?\s*(?:of)?\s*experience', text, re.IGNORECASE)
        return int(m.group(1)) if m else 0

    # ─── MAIN SEARCH ─────────────────────────────────────────

    async def search_jobs(self, user_profile: Dict, job_title: str, location: str, max_results: int = 50) -> List[Dict]:
        """
        Strategy:
        1) SerpAPI (Google Jobs) — real live postings with direct apply links
        2) RemoteOK / Jobicy — real remote job APIs as supplement
        3) AI-generated jobs as fallback if real APIs return too few
        """
        all_jobs = []
        loop = asyncio.get_running_loop()

        # 1) SerpAPI — real Google Jobs results (primary source), paginated
        serp_jobs = await loop.run_in_executor(
            None, self._search_serpapi, job_title, location, min(max_results, 30)
        )
        all_jobs.extend(serp_jobs)
        logger.info(f"SerpAPI returned {len(serp_jobs)} real jobs")

        # 2) Supplement with free APIs
        scraped = await asyncio.gather(
            loop.run_in_executor(None, self._scrape_remoteok, job_title, 10),
            loop.run_in_executor(None, self._scrape_jobicy, job_title, 10),
            return_exceptions=True
        )
        loc_lower = location.lower()
        for r in scraped:
            if isinstance(r, list):
                for job in r:
                    jloc = (job.get("location") or "").lower()
                    if "remote" in jloc or loc_lower in jloc or any(
                        city in jloc for city in self._location_variants(location)
                    ):
                        all_jobs.append(job)

        # 3) If we got fewer than 5 real jobs, supplement with AI-generated ones
        if len(all_jobs) < 5:
            ai_jobs = await self._ai_generate_jobs(
                job_title, location, user_profile, count=max(10, 15 - len(all_jobs))
            )
            all_jobs.extend(ai_jobs)
            logger.info(f"AI supplemented with {len(ai_jobs)} jobs")

        logger.info(f"Total: {len(all_jobs)} jobs before dedup")
        return self._deduplicate_jobs(all_jobs)[:max_results]

    def _location_variants(self, location: str) -> List[str]:
        """Generate location search variants for matching"""
        loc = location.lower().strip()
        variants = [loc]
        # Common Indian city aliases
        aliases = {
            "bangalore": ["bengaluru", "blr", "bangalore"],
            "bengaluru": ["bangalore", "blr", "bengaluru"],
            "mumbai": ["bombay", "mumbai"],
            "delhi": ["new delhi", "ncr", "delhi", "gurgaon", "gurugram", "noida"],
            "hyderabad": ["hyderabad", "hyd"],
            "chennai": ["madras", "chennai"],
            "pune": ["pune"],
            "kolkata": ["calcutta", "kolkata"],
            "remote": ["remote", "anywhere", "work from home", "wfh"],
        }
        for key, vals in aliases.items():
            if key in loc or any(v in loc for v in vals):
                variants.extend(vals)
        # Also add the country
        if any(city in loc for city in ["bangalore", "bengaluru", "mumbai", "delhi",
                                         "hyderabad", "chennai", "pune", "kolkata",
                                         "india", "blr", "ncr"]):
            variants.append("india")
        return list(set(variants))

    # ─── SCRAPERS ─────────────────────────────────────────────

    def _scrape_remoteok(self, title: str, limit: int) -> List[Dict]:
        try:
            query = title.lower().replace(" ", "-")
            resp = requests.get(f"https://remoteok.com/api?tag={query}",
                                headers=self.headers, timeout=10)
            if resp.status_code != 200:
                return []
            data = resp.json()
            jobs = []
            for item in data[1:limit + 1]:
                jobs.append({
                    "id": str(item.get("id", uuid.uuid4())),
                    "title": item.get("position", ""),
                    "company": item.get("company", ""),
                    "location": item.get("location", "Remote"),
                    "salary": item.get("salary", "Not disclosed"),
                    "url": item.get("url", f"https://remoteok.com/l/{item.get('id','')}"),
                    "description": item.get("description", "")[:500],
                    "required_skills": self._extract_skills(item.get("description", "")),
                    "required_experience": self._guess_exp(item.get("position", "")),
                    "source": "RemoteOK",
                    "posted_at": item.get("date", ""),
                })
            return jobs
        except Exception as e:
            logger.error(f"RemoteOK: {e}")
            return []

    def _search_serpapi(self, title: str, location: str, limit: int) -> List[Dict]:
        """Search Google Jobs via SerpAPI — returns REAL job postings with direct apply links."""
        serpapi_key = os.environ.get("SERPAPI_KEY")
        if not serpapi_key:
            logger.warning("SERPAPI_KEY not set — skipping real job search")
            return []

        jobs = []
        max_pages = min((limit // 10) + 1, 3)

        # Detect remote/international intent
        loc_lower = location.lower().strip()
        is_remote = any(kw in loc_lower for kw in ["remote", "anywhere", "worldwide", "global", "international", "work from home", "wfh"])

        try:
            next_page_token = None

            for page in range(max_pages):
                if len(jobs) >= limit:
                    break

                if is_remote:
                    query = f"{title}"
                else:
                    query = f"{title} {location}"

                params = {
                    "engine": "google_jobs",
                    "q": query,
                    "api_key": serpapi_key,
                }

                # Use next_page_token for pagination (start param is discontinued)
                if next_page_token:
                    params["next_page_token"] = next_page_token

                if is_remote:
                    params["ltype"] = "1"
                    country_hint = loc_lower.replace("remote", "").replace(",", "").strip()
                    if country_hint:
                        params["location"] = country_hint

                resp = requests.get("https://serpapi.com/search", params=params, timeout=15)
                if resp.status_code != 200:
                    logger.error(f"SerpAPI returned {resp.status_code} on page {page}: {resp.text[:500]}")
                    break

                data = resp.json()
                results = data.get("jobs_results", [])
                if not results:
                    break

                # Get next page token for pagination
                serpapi_pagination = data.get("serpapi_pagination", {})
                next_page_token = serpapi_pagination.get("next_page_token")

                for j in results:
                    # Get direct application link — prefer apply_options first
                    link = ""
                    apply_opts = j.get("apply_options", [])
                    if apply_opts:
                        for opt in apply_opts:
                            opt_link = opt.get("link", "")
                            if opt_link and "google.com/search" not in opt_link:
                                link = opt_link
                                break
                    if not link:
                        links = j.get("related_links", [])
                        for rl in links:
                            rl_link = rl.get("link", "")
                            if rl_link and "google.com/search" not in rl_link:
                                link = rl_link
                                break
                    if not link:
                        link = j.get("share_link", "")
                    if not link or "google.com/search" in link:
                        company = j.get("company_name", "")
                        job_title = j.get("title", "")
                        search_q = f"{job_title} {company} {location} apply".replace(" ", "+")
                        link = f"https://www.google.com/search?q={search_q}&udm=8"

                    extensions = j.get("detected_extensions", {})
                    jobs.append({
                        "id": str(uuid.uuid4()),
                        "title": j.get("title", ""),
                        "company": j.get("company_name", ""),
                        "location": j.get("location", location),
                        "salary": extensions.get("salary", "Not disclosed"),
                        "url": link,
                        "description": j.get("description", "")[:500],
                        "required_skills": self._extract_skills(j.get("description", "")),
                        "required_experience": self._guess_exp(j.get("title", "")),
                        "source": "Google Jobs",
                        "posted_at": extensions.get("posted_at", ""),
                    })

                # No more pages available
                if not next_page_token:
                    break

            logger.info(f"SerpAPI: {len(jobs)} real jobs found for '{title}' in '{location}' ({page + 1} pages)")
            return jobs[:limit]
        except Exception as e:
            logger.error(f"SerpAPI error: {e}")
            return jobs


    def _scrape_jobicy(self, title: str, limit: int) -> List[Dict]:
        try:
            resp = requests.get(
                f"https://jobicy.com/api/v2/remote-jobs?count={limit}&tag={title}",
                headers=self.headers, timeout=10)
            if resp.status_code != 200:
                return []
            data = resp.json()
            jobs = []
            for item in data.get("jobs", [])[:limit]:
                sal = ""
                if item.get("annualSalaryMin"):
                    sal = f"${item['annualSalaryMin']}-${item.get('annualSalaryMax','')}"
                jobs.append({
                    "id": str(item.get("id", uuid.uuid4())),
                    "title": item.get("jobTitle", ""),
                    "company": item.get("companyName", ""),
                    "location": item.get("jobGeo", "Remote"),
                    "salary": sal or "Not disclosed",
                    "url": item.get("url", ""),
                    "description": item.get("jobExcerpt", "")[:500],
                    "required_skills": self._extract_skills(item.get("jobExcerpt", "")),
                    "required_experience": self._guess_exp(item.get("jobTitle", "")),
                    "source": "Jobicy",
                    "posted_at": item.get("pubDate", ""),
                })
            return jobs
        except Exception as e:
            logger.error(f"Jobicy: {e}")
            return []

    def _guess_exp(self, title: str) -> int:
        t = title.lower()
        if any(w in t for w in ["senior", "lead", "staff", "principal", "sr."]):
            return 5
        if any(w in t for w in ["mid", " ii", "sde2", "sde-2"]):
            return 3
        if any(w in t for w in ["junior", "intern", "entry", "fresher"]):
            return 0
        return 2

    # ─── AI JOB GENERATION ────────────────────────────────────

    async def _ai_generate_jobs(self, title: str, location: str, profile: Dict, count: int) -> List[Dict]:
        system = """You are a job market expert with deep knowledge of current openings.
Generate realistic, currently-open job listings for the EXACT role and location requested.

Return JSON: {"jobs": [...]}
Each job object MUST have:
- "id": unique string
- "title": job title (variations of the requested role — SDE, Backend Engineer, Full Stack, etc.)
- "company": REAL company name that actually hires in this location
- "location": MUST be the requested city or "Remote (India)" — NEVER a different city/country
- "salary": realistic salary range for this location (use ₹ LPA for India, $ for US)
- "url": realistic careers page URL like https://careers.google.com/jobs/... or https://company.com/careers
- "description": 2-3 sentence job description
- "required_skills": ["list of 4-6 skills"]
- "required_experience": number of years
- "source": "AI Curated"
- "posted_at": "2026-03-14"

CRITICAL RULES:
- ALL jobs MUST be in the requested location or Remote
- Use REAL companies that actually have offices/hire in that location
- For Bangalore: Flipkart, Swiggy, Razorpay, Zerodha, PhonePe, CRED, Meesho, Atlassian India, Google Bangalore, Amazon Bangalore, Microsoft India, Walmart Labs, Goldman Sachs Bangalore, Cisco, SAP Labs, Infosys, Wipro, TCS, etc.
- For Mumbai: JP Morgan, Deutsche Bank, Jio, Dream11, etc.
- For Remote India: any Indian or global company with remote India roles
- Salary must be realistic: entry level ₹6-15 LPA, mid ₹15-30 LPA, senior ₹30-60 LPA, staff ₹50-80+ LPA
- Generate DIVERSE titles: SDE-1, SDE-2, Backend Engineer, Full Stack Developer, Platform Engineer, etc.
- NEVER generate jobs in locations the user didn't ask for"""

        user_msg = f"""Generate {count} job listings:
Role: {title}
Location: {location}
Candidate skills: {', '.join(profile.get('skills', [])[:10])}
Experience: {profile.get('total_years', 0)} years
Expected salary: {profile.get('expected_salary', 'Not specified')}

Every single job MUST be located in {location} or be Remote. No exceptions."""

        raw = await self._ask_llm_async(system, user_msg, json_mode=True)
        if raw:
            try:
                parsed = json.loads(raw)
                jobs = parsed.get("jobs", parsed if isinstance(parsed, list) else [])
                for job in jobs:
                    if not job.get("id"):
                        job["id"] = str(uuid.uuid4())
                    if not job.get("source"):
                        job["source"] = "AI Curated"
                    if not job.get("required_skills"):
                        job["required_skills"] = []
                    if not job.get("required_experience"):
                        job["required_experience"] = 2
                    # Replace fake/hallucinated URLs with Google Jobs search
                    url = job.get("url", "")
                    company = job.get("company", "")
                    title_str = job.get("title", "")
                    loc = job.get("location", "")
                    is_fake = (
                        not url
                        or "example.com" in url
                        or "company.com/careers" in url
                        or re.search(r'/jobs?/\d{4,}', url)  # /jobs/123456 or /job/123456
                        or url.endswith("/careers")
                        or url.endswith("/jobs")
                    )
                    if is_fake:
                        search_q = f"{title_str} {company} {loc} careers apply".replace(" ", "+")
                        job["url"] = f"https://www.google.com/search?q={search_q}&udm=8"
                logger.info(f"AI generated {len(jobs)} jobs")
                return jobs
            except json.JSONDecodeError:
                logger.error("Failed to parse AI job listings")
        return []

    def _deduplicate_jobs(self, jobs: List[Dict]) -> List[Dict]:
        seen = set()
        unique = []
        for job in jobs:
            key = f"{job.get('company','').lower().strip()}_{job.get('title','').lower().strip()}"
            if key and key != "_" and key not in seen:
                seen.add(key)
                unique.append(job)
        return unique

    # ─── AI JOB SCORING ──────────────────────────────────────

    async def score_job(self, job: Dict, user_profile: Dict) -> Dict:
        system = """You are a career advisor. Score how well a job matches a candidate.
Return JSON: {"score":0-100,"reasoning":["reason1","reason2","reason3"],"recommendation":"one line"}
Criteria: Skills overlap (40pts), Experience fit (25pts), Location (15pts), Salary (10pts), Company (10pts).
Be specific and honest."""

        user_msg = f"""Job: {job.get('title')} at {job.get('company')} in {job.get('location')}
Skills needed: {', '.join(job.get('required_skills', []))}
Experience: {job.get('required_experience', '?')}y | Salary: {job.get('salary', '?')}

Candidate: Skills: {', '.join(user_profile.get('skills', []))}
Experience: {user_profile.get('total_years', 0)}y | Location: {user_profile.get('location', '')}
Expected salary: {user_profile.get('expected_salary', '?')}"""

        raw = await self._ask_llm_async(system, user_msg, json_mode=True)
        if raw:
            try:
                r = json.loads(raw)
                return {
                    "job_id": job.get("id"),
                    "score": min(max(int(r.get("score", 50)), 0), 100),
                    "reasoning": r.get("reasoning", []),
                    "recommendation": r.get("recommendation", "")
                }
            except (json.JSONDecodeError, ValueError):
                pass

        return self._algorithmic_score(job, user_profile)

    async def score_jobs_batch(self, jobs: List[Dict], user_profile: Dict) -> List[Dict]:
        """Score ALL jobs in a single LLM call for speed."""
        if not jobs:
            return []

        job_lines = []
        for i, job in enumerate(jobs):
            job_lines.append(
                f"{i}. {job.get('title','')} @ {job.get('company','')} | "
                f"{job.get('location','')} | Skills: {','.join(job.get('required_skills',[])[:5])} | "
                f"Exp: {job.get('required_experience','?')}y | Salary: {job.get('salary','?')}"
            )

        system = """You are a career advisor. Score how well each job matches the candidate.
Return JSON: {"scores": [{"index":0,"score":0-100,"reasoning":["r1","r2"],"recommendation":"one line"}, ...]}
Criteria: Skills overlap (40pts), Experience fit (25pts), Location (15pts), Salary (10pts), Company (10pts).
Score EVERY job in the list. Be specific and honest."""

        user_msg = f"""Candidate: Skills: {', '.join(user_profile.get('skills', [])[:15])}
Experience: {user_profile.get('total_years', 0)}y | Location: {user_profile.get('location', '')}
Expected salary: {user_profile.get('expected_salary', 'Not specified')}

Jobs to score:
{chr(10).join(job_lines)}"""

        raw = await self._ask_llm_async(system, user_msg, json_mode=True)
        if raw:
            try:
                parsed = json.loads(raw)
                scores_list = parsed.get("scores", [])
                score_map = {}
                for s in scores_list:
                    idx = s.get("index", -1)
                    score_map[idx] = s

                result = []
                for i, job in enumerate(jobs):
                    if i in score_map:
                        s = score_map[i]
                        job["score"] = min(max(int(s.get("score", 50)), 0), 100)
                        job["reasoning"] = s.get("reasoning", [])
                        job["recommendation"] = s.get("recommendation", "")
                    else:
                        fb = self._algorithmic_score(job, user_profile)
                        job["score"] = fb["score"]
                        job["reasoning"] = fb["reasoning"]
                        job["recommendation"] = fb["recommendation"]
                    result.append(job)
                return result
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Batch scoring parse error: {e}")

        # Full fallback
        for job in jobs:
            fb = self._algorithmic_score(job, user_profile)
            job["score"] = fb["score"]
            job["reasoning"] = fb["reasoning"]
            job["recommendation"] = fb["recommendation"]
        return jobs

    def _algorithmic_score(self, job: Dict, profile: Dict) -> Dict:
        score, reasoning = 0, []
        u_skills = set(s.lower() for s in profile.get("skills", []))
        j_skills = set(s.lower() for s in job.get("required_skills", []))
        if u_skills and j_skills:
            overlap = len(u_skills & j_skills)
            pct = overlap / len(j_skills)
            score += int(pct * 40)
            reasoning.append(f"Skills: {overlap}/{len(j_skills)} match ({int(pct*100)}%)")
        u_yrs = profile.get("total_years", 0)
        r_yrs = job.get("required_experience", 0) or 0
        if r_yrs > 0 and u_yrs >= r_yrs:
            score += 25
            reasoning.append(f"Experience: {u_yrs}y meets {r_yrs}y requirement")
        elif r_yrs > 0:
            score += max(int((u_yrs / r_yrs) * 25), 5)
            reasoning.append(f"Experience: {u_yrs}y vs {r_yrs}y needed")
        loc = profile.get("location", "").lower()
        jloc = (job.get("location") or "").lower()
        if loc in jloc or "remote" in jloc:
            score += 15
            reasoning.append(f"Location match: {job.get('location')}")
        score += 10
        rec = "Strong Match" if score >= 80 else "Good Match" if score >= 60 else "Worth reviewing" if score >= 40 else "Low match"
        return {"job_id": job.get("id"), "score": min(score, 100),
                "reasoning": reasoning, "recommendation": rec}

    # ─── DAILY SEARCH ─────────────────────────────────────────

    async def run_daily_search(self, user_id: str):
        try:
            user = await self.db.users.find_one({"id": user_id})
            if not user:
                return
            prefs = await self.db.job_preferences.find_one({"user_id": user_id})
            if not prefs:
                return

            profile = {
                "skills": prefs.get("skills", []),
                "total_years": prefs.get("experience_years", 0),
                "location": prefs.get("location", ""),
                "expected_salary": prefs.get("expected_salary", 0),
                "preferred_companies": prefs.get("preferred_companies", [])
            }
            # Merge resume skills
            parsed = user.get("parsed_resume")
            if parsed and parsed.get("skills"):
                profile["skills"] = list(set(profile["skills"] + parsed["skills"]))

            jobs = await self.search_jobs(
                user_profile=profile,
                job_title=prefs.get("job_title", ""),
                location=prefs.get("location", ""),
                max_results=25
            )

            scored = []
            for job in jobs:
                result = await self.score_job(job, profile)
                job["score"] = result["score"]
                job["reasoning"] = result["reasoning"]
                job["recommendation"] = result["recommendation"]
                scored.append(job)

            scored.sort(key=lambda x: x["score"], reverse=True)
            top = scored[:20]

            # Save new matches (keep old ones, skip duplicates)
            for job in top:
                existing = await self.db.job_matches.find_one({
                    "user_id": user_id,
                    "title": job.get("title"),
                    "company": job.get("company")
                })
                if not existing:
                    await self.db.job_matches.insert_one({
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "job_id": job.get("id"),
                        "company": job.get("company"),
                        "title": job.get("title"),
                        "location": job.get("location"),
                        "salary": job.get("salary"),
                        "url": job.get("url"),
                        "score": job.get("score"),
                        "reasoning": job.get("reasoning"),
                        "recommendation": job.get("recommendation"),
                        "source": job.get("source", ""),
                        "status": "found",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    })
            logger.info(f"Daily search: {len(top)} matches saved for {user_id}")

            # Cleanup: remove recommendations older than 7 days
            cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
            result = await self.db.job_matches.delete_many({
                "user_id": user_id,
                "created_at": {"$lt": cutoff}
            })
            if result.deleted_count:
                logger.info(f"Cleaned up {result.deleted_count} old matches for {user_id}")
        except Exception as e:
            logger.error(f"Daily search failed: {e}")
