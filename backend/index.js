// Entry point for the Express backend server.
// Depends on: express, cors, dotenv, groq-sdk (all installed via package.json)
// Consumed by: the React frontend (http://localhost:5173) via fetch calls to /api/* routes
// Environment: requires GROQ_API_KEY to be set in a .env file at the project root

// --- Dependencies ---
// express: HTTP server and routing
// cors: allows the Vite dev server (port 5173) to call this API without cross-origin errors
// dotenv: loads GROQ_API_KEY and any other secrets from .env into process.env
// groq-sdk: official Groq client used to call the LLaMA 3.3 70B model for all AI features
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Groq = require("groq-sdk");

// --- Server & Middleware Setup ---
// Creates the Express app and applies two global middleware:
//   cors: restricts API access to the local frontend dev server only
//   express.json: parses incoming JSON request bodies so req.body is available in all routes
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// --- Groq Client ---
// Initializes the Groq SDK with the API key from .env.
// This single client instance is reused by all three AI routes below.
// All routes use the "llama-3.3-70b-versatile" model with response_format: json_object
// to guarantee the model returns parseable JSON every time.
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- POST /api/process-call ---
// Receives a raw 911 call transcript from the frontend and uses the LLM to extract
// structured patient information from natural language.
// Request body:  { transcript: string }
// Response body: { name, location, relationship, profile, history, symptoms }
// Consumed by: the frontend's transcript processing flow (displayed in the patient info panel)
// The system prompt enforces strict field names, sentence case, and fallback defaults
// (e.g. "Unidentified" for unknown names, "URGENT: Missing Location" when no address is given).
app.post("/api/process-call", async (req, res) => {
    const { transcript } = req.body;
    try {
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are a 911 dispatch assistant. Extract patient information from call transcripts and return ONLY valid JSON with these exact fields: name, location, relationship, profile, history, symptoms.

Rules:
- "name": use the victim's full name if stated. If the name was never mentioned or is unknown, set this to "Unidentified".
- "location": the precise street address or location mentioned by the caller. If an intersection is given, format as "Main St and 1st Ave". If no location is mentioned, set to "URGENT: Missing Location".
- "profile": format as labeled key-value pairs, one per line, in this exact order:
    Name: [victim's full name, or "Unidentified"]
    Sex: [Male/Female/Unknown]
    Age: [number, or "Unknown"]
    Ethnicity: [ethnicity if mentioned, otherwise omit this line]
  If the name is "Unidentified", also include any physical details the caller mentioned that could help identify the victim (approximate age, build, clothing, hair, etc.) as additional labeled lines, e.g. "Build: Heavyset", "Clothing: Red jacket". If no details at all are known, add a final line "Details: None mentioned".
- "history": format as labeled key-value pairs, one per line. Use these labels where applicable:
    Conditions: [comma-separated list of medical conditions, or "None mentioned"]
    Medications: [comma-separated list if mentioned, otherwise omit this line]
    Notes: [any other relevant medical history, or omit if none]
- "symptoms": the victim's current symptoms and condition as described by the caller. Each symptom on its own line as a plain sentence (no bullet characters).
- "relationship": the caller's relationship to the victim (e.g. spouse, bystander, etc). If not mentioned or unknown, set to "Unknown".

All field values must be plain strings. Use newline characters to separate lines within a field. Use sentence case: capitalize only the first letter of each sentence and proper nouns. Do not use ALL CAPS. Do not use bullet characters (•, -, *) — labeled lines only.`,
                },
                {
                    role: "user",
                    content: `Extract patient information from this 911 call transcript:\n\n${transcript} and use sentence case formatting for all fields. If any field is missing or cannot be determined, use the specified default values. Return the extracted information in a JSON format with the exact fields: name, location, relationship, profile, history, symptoms.`,
                },
            ],
        });
        const json = JSON.parse(completion.choices[0].message.content);
        console.log("process-call response:", json);
        res.json(json);
    } catch (err) {
        console.error("Error processing call:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- POST /api/triage ---
// Takes the extracted patient data and determines the medical urgency level,
// the leading symptom driving the decision, and the most appropriate hospital unit.
// Request body:  { symptoms: string, history: string, profile: string }
//   - These fields come directly from the /api/process-call response
// Response body: { severity: "Critical"|"Urgent"|"Non-urgent", leadingSymptom: string, recommendedUnit: string }
// Consumed by: the frontend triage panel to display severity badge and unit routing
app.post("/api/triage", async (req, res) => {
    const { symptoms, history, profile } = req.body;
    try {
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are an emergency medical triage assistant. Analyze patient data and return ONLY valid JSON with these exact fields:
- severity: must be exactly one of "Critical", "Urgent", or "Non-urgent"
- leadingSymptom: string — the primary and most urgent symptom driving the triage decision
- recommendedUnit: string — the specific hospital unit needed (e.g. "Cardiac catheterization lab", "Emergency department", "Trauma unit", "Respiratory/ICU unit")
Use sentence case: capitalize only the first letter of each sentence and proper nouns. Do not use ALL CAPS.`,
                },
                {
                    role: "user",
                    content: `Triage this patient:\nProfile: ${profile}\nMedical History: ${history}\nSymptoms: ${symptoms}`,
                },
            ],
        });
        const json = JSON.parse(completion.choices[0].message.content);
        console.log("triage response:", json);
        res.json(json);
    } catch (err) {
        console.error("Triage error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- POST /api/recommend-hospitals ---
// Scores and ranks a list of nearby hospitals against the current patient's profile,
// history, and symptoms to recommend the best destination for the ambulance.
// Request body:  { patient: { profile, history, symptoms }, hospitals: Hospital[] }
//   - patient fields come from /api/process-call
//   - hospitals array is fetched by the frontend from the hospital data source,
//     each entry includes HospitalName, HospitalInfo, HospitalNameDistance, DriveTime
// Response body: { hospitals: [{ HospitalName, Recommendscore, AiRecommend, HospitalInfo, HospitalDetails }] }
//   - AiRecommend is true on exactly one hospital (the top pick)
//   - Consumed by: the hospital list panel and Map component in the frontend
// The hospital list is pre-formatted into a numbered text block before being sent to the LLM
// so the model can directly compare proximity and capability in a single prompt.
app.post("/api/recommend-hospitals", async (req, res) => {
    const { patient, hospitals } = req.body;
    try {
        // Format the hospitals array into a readable list for the LLM prompt
        const hospitalList = hospitals
            .map((h) => `- ${h.HospitalName}: ${h.HospitalInfo}, ${h.HospitalNameDistance}km away, ${h.DriveTime} min drive`)
            .join("\n");

        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are a hospital routing AI for 911 dispatch. Score hospitals for a patient and return ONLY valid JSON with a "hospitals" array. Each item must have:
- HospitalName: string (exact match to input)
- Recommendscore: string (e.g. "87%")
- AiRecommend: boolean (true for the single best hospital only)
- HospitalInfo: string (exactly 5 words or fewer — a blunt verdict on whether this hospital fits THIS patient's specific emergency. Focus on the single deciding factor. No filler words. Examples for a cardiac case: "Best cardiac cath lab match", "No cardiac surgery unit", "Too far for cardiac event", "Closest trauma cardiac centre")
- HospitalDetails: string (2–3 sentences explaining the full clinical reasoning for or against this hospital for this specific patient)
Use sentence case: capitalize only the first letter of each sentence and proper nouns. Do not use ALL CAPS.`,
                },
                {
                    role: "user",
                    content: `Patient:\nProfile: ${patient.profile}\nHistory: ${patient.history}\nSymptoms: ${patient.symptoms}\n\nHospitals:\n${hospitalList}\n\nScore and rank these hospitals for this patient.`,
                },
            ],
        });
        const json = JSON.parse(completion.choices[0].message.content);
        console.log("recommend-hospitals response:", json);
        res.json(json);
    } catch (err) {
        console.error("Hospital recommendation error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- Server Start ---
// Starts the HTTP server on port 8080. The frontend proxies all /api/* requests here.
app.listen(8080, () => console.log("Server running on port 8080"));
