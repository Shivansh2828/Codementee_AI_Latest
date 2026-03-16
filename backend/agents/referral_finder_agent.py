"""
AI Referral Finder Agent — Real Implementation
Uses SerpAPI to find REAL LinkedIn employees, Groq LLM for message drafting and follow-ups.
"""

import asyncio
import json
import os
import re
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional
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
    return OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1"
    )


class ReferralFinderAgent:
    """
    AI agent that automates referral finding and outreach.
    - AI-powered employee discovery at target companies
    - AI-generated personalized referral messages (formal, friendly, concise)
    - AI-powered follow-up message generation
    - Outreach tracking & referral pipeline management
    """

    def __init__(self, db, **kwargs):
        self.db = db
        self.llm = get_groq_client()

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
                "max_tokens": 2500,
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

    # ─── REAL EMPLOYEE DISCOVERY VIA SERPAPI ─────────────────

    async def find_employees(
        self,
        company: str,
        role_filter: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict]:
        """
        Find REAL employees at a company using SerpAPI Google Search.
        Searches Google for 'site:linkedin.com/in "<company>" "<role>"'
        to find actual public LinkedIn profiles.
        """
        loop = asyncio.get_running_loop()
        employees = await loop.run_in_executor(
            None, self._search_linkedin_via_serpapi, company, role_filter, limit
        )

        if employees:
            logger.info(f"SerpAPI found {len(employees)} real LinkedIn profiles for {company}")
            # Use AI to enrich with referral tips
            employees = await self._enrich_employees_with_ai(employees, company)
            return employees

        # Fallback to AI-generated profiles if SerpAPI fails or returns nothing
        logger.warning(f"SerpAPI returned 0 results for {company}, falling back to AI")
        return await self._ai_generate_employees(company, role_filter, limit)

    def _search_linkedin_via_serpapi(self, company: str, role_filter: Optional[str], limit: int) -> List[Dict]:
        """Use SerpAPI Google Search with site:linkedin.com/in to find real employees."""
        serpapi_key = os.environ.get("SERPAPI_KEY")
        if not serpapi_key:
            logger.warning("SERPAPI_KEY not set — cannot search real LinkedIn profiles")
            return []

        try:
            # Build search query
            query = f'site:linkedin.com/in "{company}"'
            if role_filter:
                query += f' "{role_filter}"'

            params = {
                "engine": "google",
                "q": query,
                "api_key": serpapi_key,
                "num": min(limit, 20),
            }

            resp = requests.get("https://serpapi.com/search", params=params, timeout=15)
            if resp.status_code != 200:
                logger.error(f"SerpAPI returned {resp.status_code}")
                return []

            results = resp.json().get("organic_results", [])
            employees = []

            for r in results:
                title = r.get("title", "")
                link = r.get("link", "")
                snippet = r.get("snippet", "")

                # Only process linkedin.com/in/ URLs
                if "linkedin.com/in/" not in link:
                    continue

                # Parse name and role from Google result title
                # Typical format: "FirstName LastName - Role - Company | LinkedIn"
                parsed = self._parse_linkedin_title(title, company)
                if not parsed:
                    continue

                name, role = parsed

                # Extract additional info from snippet
                seniority = self._guess_seniority(role)

                employees.append({
                    "id": str(uuid.uuid4()),
                    "name": name,
                    "company": company,
                    "role": role,
                    "department": self._guess_department(role),
                    "seniority": seniority,
                    "linkedin_url": link,
                    "years_at_company": 0,  # Can't determine from Google results
                    "background": snippet[:200] if snippet else "",
                    "referral_likelihood": "medium",
                    "best_approach": "",
                    "connection_degree": "unknown",
                    "mutual_connections": 0,
                    "source": "LinkedIn (via Google)"
                })

            return employees[:limit]

        except Exception as e:
            logger.error(f"SerpAPI LinkedIn search error: {e}")
            return []

    def _parse_linkedin_title(self, title: str, company: str) -> Optional[tuple]:
        """
        Parse LinkedIn profile title from Google results.
        Common formats:
        - "John Doe - Software Engineer - Amazon | LinkedIn"
        - "John Doe – Senior SDE at Amazon | LinkedIn"
        - "John Doe | LinkedIn"
        """
        # Remove " | LinkedIn" or " - LinkedIn" suffix
        title = re.sub(r'\s*[\|–-]\s*LinkedIn\s*$', '', title, flags=re.IGNORECASE).strip()

        if not title:
            return None

        # Try splitting by " - " or " – " or " | "
        parts = re.split(r'\s*[\|–-]\s*', title)
        parts = [p.strip() for p in parts if p.strip()]

        if not parts:
            return None

        name = parts[0]

        # Skip if name looks like a company name or is too short
        if len(name) < 3 or name.lower() == company.lower():
            return None

        # Try to find role from remaining parts
        role = ""
        for part in parts[1:]:
            # Skip parts that are just the company name
            if part.lower().strip() == company.lower().strip():
                continue
            # This is likely the role
            if not role:
                role = part

        if not role:
            role = "Employee"

        return (name, role)

    def _guess_seniority(self, role: str) -> str:
        r = role.lower()
        if any(w in r for w in ["director", "vp", "vice president", "head of", "chief"]):
            return "director"
        if any(w in r for w in ["manager", "mgr"]):
            return "manager"
        if any(w in r for w in ["senior", "sr.", "sr ", "lead", "staff", "principal"]):
            return "senior"
        if any(w in r for w in ["junior", "jr.", "jr ", "intern", "associate", "entry"]):
            return "junior"
        return "mid"

    def _guess_department(self, role: str) -> str:
        r = role.lower()
        if any(w in r for w in ["engineer", "developer", "sde", "swe", "devops", "architect", "cto"]):
            return "Engineering"
        if any(w in r for w in ["product", "pm"]):
            return "Product"
        if any(w in r for w in ["design", "ux", "ui"]):
            return "Design"
        if any(w in r for w in ["recruit", "talent", "hr", "people"]):
            return "Talent/HR"
        if any(w in r for w in ["market", "growth", "brand"]):
            return "Marketing"
        if any(w in r for w in ["sales", "account", "business dev"]):
            return "Sales"
        if any(w in r for w in ["data", "analyst", "analytics", "ml", "machine learning", "ai"]):
            return "Data/AI"
        return "Other"

    async def _enrich_employees_with_ai(self, employees: List[Dict], company: str) -> List[Dict]:
        """Use AI to add referral tips and likelihood for each employee."""
        if not self.llm or not employees:
            return employees

        emp_lines = []
        for i, emp in enumerate(employees):
            emp_lines.append(f"{i}. {emp['name']} — {emp['role']} ({emp['seniority']})")

        system = """You are a career networking expert. For each employee, assess:
1. referral_likelihood: "high", "medium", or "low" based on their role
2. best_approach: One sentence on how to approach them for a referral

Rules:
- Engineers/managers are usually "high" likelihood — they can refer directly
- Recruiters are "high" — it's literally their job
- Directors/VPs are "low" — too senior, harder to reach
- Product/Design are "medium"

Return JSON: {"employees": [{"index": 0, "referral_likelihood": "high", "best_approach": "..."}, ...]}"""

        user_msg = f"Company: {company}\n\nEmployees:\n" + "\n".join(emp_lines)

        raw = await self._ask_llm_async(system, user_msg, json_mode=True)
        if raw:
            try:
                parsed = json.loads(raw)
                enrichments = {e["index"]: e for e in parsed.get("employees", [])}
                for i, emp in enumerate(employees):
                    if i in enrichments:
                        emp["referral_likelihood"] = enrichments[i].get("referral_likelihood", "medium")
                        emp["best_approach"] = enrichments[i].get("best_approach", "")
            except (json.JSONDecodeError, KeyError):
                logger.error("Failed to parse AI enrichment for employees")

        return employees

    async def _ai_generate_employees(self, company: str, role_filter: Optional[str], limit: int) -> List[Dict]:
        """Fallback: AI-generated employee profiles when SerpAPI returns nothing."""
        system = """You are a professional networking expert. Generate realistic employee profiles
for the given company based on public knowledge. These are AI-suggested profiles to help
the user know what kinds of roles to target.

Return JSON:
{
  "employees": [
    {
      "name": "Suggested Name",
      "role": "Job title",
      "department": "Engineering/Product/etc",
      "seniority": "junior/mid/senior/lead/manager/director",
      "background": "1 sentence",
      "referral_likelihood": "high/medium/low",
      "best_approach": "1 sentence"
    }
  ]
}"""

        role_hint = f"\nFocus on roles related to: {role_filter}" if role_filter else ""
        user_msg = f"Company: {company}\nGenerate {min(limit, 10)} profiles.{role_hint}"

        raw = await self._ask_llm_async(system, user_msg, json_mode=True)
        if raw:
            try:
                parsed = json.loads(raw)
                employees = []
                for emp in parsed.get("employees", [])[:limit]:
                    role = emp.get("role", "Software Engineer")
                    search_q = f'{company} {role}'.replace(' ', '%20')
                    employees.append({
                        "id": str(uuid.uuid4()),
                        "name": emp.get("name", "Unknown"),
                        "company": company,
                        "role": role,
                        "department": emp.get("department", "Engineering"),
                        "seniority": emp.get("seniority", "mid"),
                        "linkedin_url": f"https://www.linkedin.com/search/results/people/?keywords={search_q}",
                        "years_at_company": 0,
                        "background": emp.get("background", ""),
                        "referral_likelihood": emp.get("referral_likelihood", "medium"),
                        "best_approach": emp.get("best_approach", ""),
                        "connection_degree": "unknown",
                        "mutual_connections": 0,
                        "source": "AI Suggested"
                    })
                return employees
            except json.JSONDecodeError:
                pass

        return self._fallback_employees(company, limit)

    def _fallback_employees(self, company: str, limit: int) -> List[Dict]:
        roles = [
            ("Software Engineer", "Engineering", "mid"),
            ("Senior Software Engineer", "Engineering", "senior"),
            ("Engineering Manager", "Engineering", "manager"),
            ("Technical Lead", "Engineering", "lead"),
            ("Staff Engineer", "Engineering", "senior"),
            ("Product Manager", "Product", "mid"),
            ("Technical Recruiter", "Talent", "mid"),
            ("Senior Product Manager", "Product", "senior"),
            ("DevOps Engineer", "Infrastructure", "mid"),
            ("Frontend Engineer", "Engineering", "mid"),
        ]
        employees = []
        for i in range(min(limit, len(roles))):
            role, dept, seniority = roles[i]
            employees.append({
                "id": str(uuid.uuid4()),
                "name": f"{company} Employee {i+1}",
                "company": company,
                "role": role,
                "department": dept,
                "seniority": seniority,
                "linkedin_url": f"https://linkedin.com/search/results/people/?keywords={company}%20{role.replace(' ', '%20')}",
                "years_at_company": (i % 5) + 1,
                "background": "",
                "referral_likelihood": "medium",
                "best_approach": "Connect on LinkedIn with a personalized note",
                "connection_degree": "2nd",
                "mutual_connections": 0,
                "source": "Fallback"
            })
        return employees

    # ─── AI MESSAGE DRAFTING ──────────────────────────────────

    async def draft_referral_message(
        self,
        employee: Dict,
        user_profile: Dict,
        job_details: Optional[Dict] = None
    ) -> Dict:
        """
        AI-generated personalized referral messages in 3 variants:
        formal, friendly, and concise. Includes a recommendation on which to use.
        """
        emp_name = employee.get("name", "there")
        emp_role = employee.get("role", "employee")
        company = employee.get("company", "your company")
        user_name = user_profile.get("name", "a professional")
        user_role = user_profile.get("current_role", "software engineer")
        skills = user_profile.get("skills", [])
        best_approach = employee.get("best_approach", "")
        job_url = job_details.get("url", "") if job_details else ""

        system = """You are an expert career coach who writes compelling LinkedIn referral messages.
You craft messages that are professional, personalized, and have high response rates.

Return JSON:
{
  "formal": "Full formal message text",
  "friendly": "Full friendly message text",
  "concise": "Full concise message text (under 100 words)",
  "recommended": "formal or friendly or concise",
  "tips": ["tip1", "tip2", "tip3"]
}

Rules:
- Never be pushy or desperate
- Show genuine interest in the company
- Mention specific skills that are relevant
- Keep formal under 200 words, friendly under 180 words, concise under 100 words
- Include a clear but soft ask for referral
- If a job URL is provided, mention it naturally"""

        user_msg = f"""Draft referral request messages:

Recipient: {emp_name}, {emp_role} at {company}
Seniority: {employee.get('seniority', 'unknown')}
Best approach hint: {best_approach}

Sender: {user_name}, currently a {user_role}
Key skills: {', '.join(skills[:8]) if skills else 'Not specified'}
Target role: {user_profile.get('target_role', user_role)}
{f'Job URL: {job_url}' if job_url else ''}

Generate 3 message variants and recommend which one to use."""

        raw = await self._ask_llm_async(system, user_msg, json_mode=True)
        if raw:
            try:
                result = json.loads(raw)
                return {
                    "formal": result.get("formal", ""),
                    "friendly": result.get("friendly", ""),
                    "concise": result.get("concise", ""),
                    "recommended": result.get("recommended", "friendly"),
                    "tips": result.get("tips", [])
                }
            except json.JSONDecodeError:
                logger.error("Failed to parse AI referral messages")

        # Fallback: template-based
        return self._template_messages(emp_name, company, user_name, user_role, skills)

    def _template_messages(self, emp_name, company, user_name, user_role, skills):
        skill_str = ", ".join(skills[:4]) if skills else "relevant technical skills"
        return {
            "formal": (
                f"Hi {emp_name},\n\n"
                f"I hope this message finds you well. I'm {user_name}, currently working as a {user_role}. "
                f"I'm very interested in opportunities at {company} and believe my experience in {skill_str} "
                f"aligns well with the team's work.\n\n"
                f"Would you be open to a brief conversation about your experience at {company}? "
                f"I'd also appreciate any guidance on the referral process.\n\n"
                f"Thank you for your time.\n\nBest regards,\n{user_name}"
            ),
            "friendly": (
                f"Hey {emp_name}!\n\n"
                f"I came across your profile and saw you're at {company} — that's awesome! "
                f"I'm {user_name}, a {user_role} with experience in {skill_str}.\n\n"
                f"I'm really excited about what {company} is building and would love to learn more "
                f"about your experience there. If you think I'd be a good fit, I'd appreciate "
                f"hearing about the referral process.\n\n"
                f"Thanks so much!\n{user_name}"
            ),
            "concise": (
                f"Hi {emp_name},\n\n"
                f"I'm {user_name}, a {user_role} interested in joining {company}. "
                f"My background in {skill_str} seems like a strong fit. "
                f"Would you be open to referring me? Happy to share my resume.\n\n"
                f"Thanks!\n{user_name}"
            ),
            "recommended": "friendly",
            "tips": [
                "Personalize further by mentioning something specific about the company",
                "Connect on LinkedIn first before sending the message",
                "Follow up after 3-5 days if no response"
            ]
        }

    # ─── AI FOLLOW-UP GENERATION ──────────────────────────────

    async def generate_follow_up_message(
        self,
        original_message: str,
        days_since: int
    ) -> str:
        """AI-generated contextual follow-up message based on original outreach."""
        system = """You are a career networking expert. Write a follow-up message for a referral request
that didn't get a response. Be polite, brief, and not pushy. Under 80 words."""

        user_msg = f"""Original message sent {days_since} days ago:
{original_message[:500]}

Write a natural follow-up. Don't repeat the original message verbatim.
If it's been less than 5 days, be gentle. If more than 7 days, be more direct but still polite."""

        raw = await self._ask_llm_async(system, user_msg)
        if raw:
            return raw

        # Fallback
        if days_since <= 5:
            return ("Hi again,\n\nJust wanted to follow up on my previous message. "
                    "I understand you're busy — would love to connect whenever you have a moment.\n\nThanks!")
        return ("Hi,\n\nI wanted to circle back on my earlier message. "
                "I'm still very interested in exploring opportunities at your company. "
                "Would appreciate any guidance you can share.\n\nThank you!")

    # ─── OUTREACH TRACKING ────────────────────────────────────

    async def track_outreach(
        self,
        user_id: str,
        employee_id: str,
        message_sent: str,
        platform: str = "linkedin"
    ) -> str:
        outreach_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "employee_id": employee_id,
            "platform": platform,
            "message_sent": message_sent,
            "status": "sent",
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "follow_up_scheduled": (datetime.now(timezone.utc) + timedelta(days=3)).isoformat(),
            "response_received": False,
            "response_text": None,
            "response_at": None
        }
        await self.db.referral_outreach.insert_one(outreach_doc)
        return outreach_doc["id"]

    async def schedule_follow_up(self, outreach_id: str, days_after: int = 3):
        follow_up_date = datetime.now(timezone.utc) + timedelta(days=days_after)
        await self.db.referral_outreach.update_one(
            {"id": outreach_id},
            {"$set": {
                "follow_up_scheduled": follow_up_date.isoformat(),
                "follow_up_status": "scheduled"
            }}
        )

    async def update_response(
        self,
        outreach_id: str,
        response_text: str,
        response_type: str
    ):
        await self.db.referral_outreach.update_one(
            {"id": outreach_id},
            {"$set": {
                "response_received": True,
                "response_text": response_text,
                "response_type": response_type,
                "response_at": datetime.now(timezone.utc).isoformat(),
                "status": "responded"
            }}
        )

    # ─── REFERRAL PIPELINE ────────────────────────────────────

    async def get_referral_pipeline(self, user_id: str) -> Dict:
        pipeline = await self.db.referral_outreach.find(
            {"user_id": user_id}
        ).to_list(length=None)

        stats = {
            "total_outreach": len(pipeline),
            "sent": len([p for p in pipeline if p["status"] == "sent"]),
            "responded": len([p for p in pipeline if p["response_received"]]),
            "positive_responses": len([p for p in pipeline if p.get("response_type") == "positive"]),
            "pending_follow_up": len([p for p in pipeline if p.get("follow_up_status") == "scheduled"]),
            "response_rate": 0
        }
        if stats["total_outreach"] > 0:
            stats["response_rate"] = round(
                (stats["responded"] / stats["total_outreach"]) * 100, 1
            )

        by_company = {}
        for outreach in pipeline:
            employee = await self.db.referral_employees.find_one({"id": outreach["employee_id"]})
            if employee:
                company = employee.get("company", "Unknown")
                if company not in by_company:
                    by_company[company] = {"total": 0, "responded": 0, "positive": 0}
                by_company[company]["total"] += 1
                if outreach["response_received"]:
                    by_company[company]["responded"] += 1
                if outreach.get("response_type") == "positive":
                    by_company[company]["positive"] += 1

        return {
            "stats": stats,
            "by_company": by_company,
            "recent_outreach": pipeline[-10:]
        }

    # ─── COMPLETE WORKFLOW ────────────────────────────────────

    async def find_and_draft_workflow(
        self,
        user_id: str,
        target_company: str,
        role_filter: Optional[str] = None
    ) -> Dict:
        """
        Complete workflow: AI finds employees → AI drafts personalized messages for top picks.
        Only drafts messages for top 3 employees upfront to avoid timeouts.
        User can request messages for others via the /draft-message endpoint.
        """
        try:
            user = await self.db.users.find_one({"id": user_id})
            if not user:
                raise ValueError(f"User {user_id} not found")

            # Build user profile from multiple sources
            prefs = await self.db.job_preferences.find_one({"user_id": user_id})
            parsed_resume = user.get("parsed_resume", {}) or {}

            skills = []
            if prefs and prefs.get("skills"):
                skills = prefs["skills"]
            if parsed_resume.get("skills"):
                skills = list(set(skills + parsed_resume["skills"]))

            user_profile = {
                "name": user.get("name", ""),
                "current_role": parsed_resume.get("current_role", "") or prefs.get("job_title", "") if prefs else "",
                "skills": skills,
                "target_role": prefs.get("job_title", "") if prefs else ""
            }

            # AI-powered employee discovery
            employees = await self.find_employees(
                company=target_company,
                role_filter=role_filter,
                limit=15
            )

            # Draft messages only for top 3 to avoid timeout, rest get empty messages
            results = []
            for i, employee in enumerate(employees):
                if i < 3:
                    messages = await self.draft_referral_message(
                        employee=employee,
                        user_profile=user_profile
                    )
                else:
                    messages = None

                # Save employee to DB
                employee_doc = {
                    **employee,
                    "discovered_by": user_id,
                    "discovered_at": datetime.now(timezone.utc).isoformat()
                }
                await self.db.referral_employees.insert_one(employee_doc)

                results.append({
                    "employee": employee,
                    "messages": messages
                })

            logger.info(f"Found {len(results)} employees at {target_company} for user {user_id}")

            return {
                "company": target_company,
                "total_found": len(results),
                "employees": results
            }

        except Exception as e:
            logger.error(f"Find and draft workflow failed: {e}")
            raise

    # ─── DAILY FOLLOW-UPS ─────────────────────────────────────

    async def run_daily_follow_ups(self):
        today = datetime.now(timezone.utc).isoformat()
        pending = await self.db.referral_outreach.find({
            "follow_up_scheduled": {"$lte": today},
            "follow_up_status": "scheduled",
            "response_received": False
        }).to_list(length=None)

        logger.info(f"Found {len(pending)} outreach items needing follow-up")

        for outreach in pending:
            try:
                sent_at = datetime.fromisoformat(outreach["sent_at"])
                days_since = (datetime.now(timezone.utc) - sent_at).days

                follow_up = await self.generate_follow_up_message(
                    outreach["message_sent"], days_since
                )

                await self.db.referral_outreach.update_one(
                    {"id": outreach["id"]},
                    {"$set": {
                        "follow_up_status": "ready",
                        "follow_up_message": follow_up
                    }}
                )
            except Exception as e:
                logger.error(f"Failed to process follow-up for {outreach['id']}: {e}")
