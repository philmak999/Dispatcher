# Dispatcher

An AI-powered 911 dispatch assistant that transforms a live emergency call into a structured patient case, medical triage, and ranked hospital recommendations — in seconds, without manual data entry.

---

## The Problem

Traditional 911 dispatch requires operators to simultaneously listen to a caller, manually document patient details, assess urgency, and identify the best hospital — all under extreme time pressure. Dispatcher automates the documentation and decision-support layer so operators can focus entirely on the caller.

---

## AI Capabilities

Dispatcher uses a **large language model (LLM)** across three distinct AI tasks, each powered by carefully engineered prompts. All three run on the backend as part of a single GraphQL mutation, so the operator receives a complete case the moment the call ends.

Future updates: 
- AI-generated report summaries for all or specific cases per operator or total across all operators
- Requesting participation and access to live hospital data for AI solutions to cutting down ER wait times across the city. 

### Summary

| # | AI solutions to 911 emergency dispatch calls |
|---|---|---|
| 1 | **Transcript-to-Case Extraction** | Converts a 911 call transcript into a structured and fully customizable patient case summary — name, location, profile, medical background, and symptoms — with prompts specifically structured to train the LLM with more cases |
| 2 | **Medical Triage** | Evaluates and assigns a severity level (Critical / Urgent / Non-urgent), identifies the primary health concern, and recommends the specific hospital unit 
| 3 | **Hospital Scoring and Routing** | Scores and ranks every nearby hospital against the patient's specific emergency based on various criteria such as departmental requirements, distance/traffic, and planned to add live ER wait times |

---

### 1. Transcript-to-Case Extraction

**What it does:** Converts a raw, unstructured 911 call transcript into a structured patient record.

**Input:** A free-form transcript of the conversation between the caller and the operator.

**Output fields:**
| Field | Description |
|---|---|
| `name` | Victim's full name, or `"Unidentified"` with available physical descriptors |
| `location` | Precise street address, intersection format, or `"URGENT: Missing Location"` |
| `relationship` | Caller's relationship to the victim |
| `profile` | Labeled key-value block: Name, Sex, Age, Ethnicity |
| `history` | Medical concern type, existing conditions, medications, clinical notes |
| `symptoms` | Each reported symptom as a separate plain sentence |

**Prompt engineering decisions:**
- **Strict output schema**: The system prompt specifies exact field names and enforces structured label-value formatting (`Name: Gabriel Smith`, not unstructured prose). This makes the output directly renderable in the UI without any parsing logic.
- **Fallback defaults**: Every field has a specified fallback value for cases where the information is absent (`"Unidentified"`, `"URGENT: Missing Location"`, `"Unknown"`). This prevents null states from reaching the interface.
- **Unidentified victim handling**: If the name is unknown, the prompt instructs the model to include any physical identifiers mentioned by the caller (build, clothing, hair colour) as additional labeled lines — preserving clinically useful context.
- **Formatting constraints**: The prompt explicitly forbids ALL CAPS, bullet characters (`•`, `-`, `*`), and free-form prose in labeled fields. This enforces visual consistency across all calls regardless of how the caller spoke.
- **Sentence case enforcement**: Applied globally to prevent the model from defaulting to uppercase medical shorthand (e.g. `CHEST PAIN` → `Chest pain`).

---

### 2. Medical Triage

**What it does:** Analyzes the extracted patient data and assigns a medical urgency level, identifies the primary driving symptom, and recommends the appropriate hospital unit.

**Input:** `profile`, `history`, and `symptoms` from the extraction step.

**Output fields:**
| Field | Description |
|---|---|
| `severity` | Exactly one of `"Critical"`, `"Urgent"`, or `"Non-urgent"` |
| `leadingSymptom` | The single most urgent symptom driving the triage decision |
| `recommendedUnit` | The specific hospital unit needed (e.g. `"Cardiac catheterization lab"`) |

**Prompt engineering decisions:**
- **Constrained severity vocabulary**: The prompt restricts `severity` to exactly three values. This eliminates ambiguity in the UI, where severity maps directly to a colour-coded badge (`--critical`, `--urgent`, `--non-urgent`).
- **Single-symptom focus**: Rather than a list of concerns, `leadingSymptom` forces the model to identify and name the single deciding factor — mirroring how clinical triage prioritisation works in practice.
- **Unit specificity**: The model is directed to name a specific unit rather than a department (e.g. `"Cardiac catheterization lab"` not `"Cardiology"`). This gives dispatch actionable routing information rather than a general category.
- **Chained context**: The triage prompt receives the full profile, history, and symptoms extracted in step 1 — allowing the model to reason holistically across comorbidities, not just the presenting symptom in isolation.

---

### 3. AI Hospital Scoring and Routing

**What it does:** Scores and ranks every nearby hospital against the specific patient's emergency, identifies the single best destination, and generates clinical reasoning for each option.

**Input:** Patient profile, history, and symptoms from step 1, plus a pre-formatted list of hospitals with their distance and drive time from the scene.

**Output per hospital:**
| Field | Description |
|---|---|
| `HospitalName` | Exact match to input name |
| `Recommendscore` | Match percentage (e.g. `"87%"`) |
| `AiRecommend` | `true` on exactly one hospital — the top pick |
| `HospitalInfo` | 5-word-or-fewer verdict on fit for this specific patient |
| `HospitalDetails` | 2–3 sentence clinical reasoning |

**Prompt engineering decisions:**
- **Patient-specific scoring, not generic ranking**: The prompt explicitly instructs the model to score hospitals against *this patient's emergency*, not their general capability. A world-class cardiac centre scores poorly if the patient has a head injury.
- **Proximity integration**: Hospital distance and drive time are embedded directly into the prompt text (`"2km away, 5 min drive"`), allowing the model to factor time-sensitivity into its scores — a hospital 10 minutes further may score significantly lower for a cardiac event.
- **Hard constraint on AiRecommend**: The prompt specifies that `AiRecommend` must be `true` on *exactly one* hospital. This prevents ties or multiple recommendations from creating ambiguity at dispatch.
- **Forced brevity on HospitalInfo**: A strict 5-word cap requires the model to produce a blunt, scannable verdict rather than hedged medical prose. The operator sees this at a glance on each hospital card.
- **Extended reasoning in HospitalDetails**: Alongside the brief verdict, the model provides 2–3 sentences of full clinical reasoning — available on demand for operators who need to justify or challenge the recommendation.
- **Pre-formatted hospital list**: Before the AI call, the hospitals array is converted to a consistent human-readable block (`- Hospital Name: Info, Xkm away, Y min drive`). Structured context like this significantly improves LLM reasoning consistency compared to sending raw JSON.

---

## GraphQL: Streamlining API calls

Consolidation of AI steps into a **single GraphQL mutation**, ensuring only specific data are called. 

**Why this matters:**

Multiple sequential fetch calls unnecessarily increased time and resources used relating to the AI calls plus network requests. 

With GraphQL:
- The frontend sends **one request** to the backend when the emergency call ends
- The `graphql-http` in the backend is set up to run all AI steps in one sequence
- The frontend receives the **conslidated response** containing the specific information and populates the case summary with pertinent details related to the emergency call powered by AI

The GraphQL schema (`typeDefs`) also acts as a formal contract between backend and frontend. The exact shape of `patientData`, `triageData`, and `scoredHospitals` is declared and enforced — field name mismatches are caught immediately rather than silently producing undefined values at render time.

---

## Live Call Workflow

```
Operator opens emergency call
        ↓
Voice recording (Web Speech API — browser-native, no AI)
        ↓
Operator ends call → single GraphQL mutation fires
        ↓
  Backend resolver:
  ├─ AI call 1: transcript → structured patient record
  ├─ AI call 2: patient record → severity + triage + unit
  └─ AI call 3: patient + hospitals → scored + ranked list
        ↓
Case Summary panel populated with patient data and triage
Hospital cards rendered with AI match scores and reasoning
Map routes ambulance to selected hospital via Directions API
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, SCSS (BEM) |
| Backend | Node.js, Express 5 |
| AI Model | Groq (Free LLM API for demonstration purposes) |
| API Layer | GraphQL via `graphql-http` + `@graphql-tools/schema` |
| Maps | MapBox API (Free map API for demonstration purposes) |
| Voice | Web Speech API (for demonstration purposes) |
| Database | MySQL with `mysql2` (hospital data import, placeholder for live hospital API data) |

---

## Environment Variables

**`backend/.env`**
```
GROQ_API_KEY=your_groq_api_key
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dispatcher
```

**`frontend/.env`**
```
VITE_MAPBOX_TOKEN=your_mapbox_public_token
```

---

## Running Locally

```bash
# Backend
cd backend
npm install
node index.js        # GraphQL API on http://localhost:8080/graphql

# Frontend (separate terminal)
cd frontend
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

---

## Future Additions

- **Live hospital capacity data**: Feed real-time ER wait times and unit availability into the hospital scoring prompt to replace static capability descriptions
- **Model upgrade path**: The prompt structure is model-agnostic — the backend can be pointed at any LLM provider without changing application logic or prompt content
- **GraphQL hospital query**: Move the static hospital list in `App.jsx` to a `hospitals` GraphQL query backed by the MySQL database
- **HIPAA-compliant data handling**: Encrypted transit, access logging, and session-scoped data retention for production deployment
- **Multi-unit dispatch**: Extend the triage output to support scenarios requiring multiple simultaneous hospital destinations (e.g. mass casualty)
