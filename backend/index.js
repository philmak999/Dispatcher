// Entry point for the Express backend server.
// Depends on: express, cors, dotenv, groq-sdk, @apollo/server, graphql
// Consumed by: the React frontend (http://localhost:5173) via a single GraphQL mutation at /graphql
// Environment: requires GROQ_API_KEY to be set in a .env file at the project root

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Groq = require("groq-sdk");
const { createHandler } = require("graphql-http/lib/use/express");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- GraphQL Schema ---
// HospitalInput: the static hospital fields the frontend sends in (name, info, distance, drive time)
// CallResult: the combined output of all three AI steps returned in one response
const typeDefs = `
  input HospitalInput {
    HospitalName: String!
    HospitalInfo: String!
    HospitalNameDistance: String!
    DriveTime: String!
  }

  type PatientData {
    name: String!
    location: String!
    relationship: String!
    profile: String!
    history: String!
    symptoms: String!
  }

  type TriageData {
    severity: String!
    leadingSymptom: String!
    recommendedUnit: String!
  }

  type ScoredHospital {
    HospitalName: String!
    Recommendscore: String!
    AiRecommend: Boolean!
    HospitalInfo: String!
    HospitalDetails: String!
  }

  type CallResult {
    patientData: PatientData!
    triageData: TriageData!
    scoredHospitals: [ScoredHospital!]!
  }

  type Query {
    _empty: String
  }

  type Mutation {
    processEmergencyCall(transcript: String!, hospitals: [HospitalInput!]!): CallResult!
  }
`;

// --- Resolvers ---
// processEmergencyCall runs all three Groq calls sequentially server-side,
// then returns the combined result in a single response to the frontend.
const resolvers = {
  Mutation: {
    processEmergencyCall: async (_, { transcript, hospitals }) => {
      // Step 1: Extract patient data from transcript
      const callCompletion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a 911 dispatch assistant. Extract patient information from call transcripts and return ONLY valid JSON with these exact fields: name, location, relationship, profile, history, symptoms.

Rules:
- "name": use the victim's full name if stated. If the name was never mentioned or is unknown, set this to "Unidentified".
- "location": the precise street address or location mentioned by the caller. If an intersection is given, format as "Main St & 1st Ave" (use & not "and"). If a specific location is given (i.e. Eaton Centre, CN Tower, etc.), provide the exact name of the location mentioned. If no location is mentioned, set to "URGENT: Missing Location".
- "profile": format as labeled key-value pairs, one per line, in this exact order:
    Name: [victim's full name, or "Unidentified"]
    Sex: [Male/Female/Unknown]
    Age: [number, or "Unknown"]
    Ethnicity: [ethnicity if mentioned, otherwise omit this line]
  If the name is "Unidentified", also include any physical details the caller mentioned that could help identify the victim (approximate age, build, clothing, hair, etc.) as additional labeled lines, e.g. "Build: Heavyset", "Clothing: Red jacket". If no details at all are known, add a final line "Details: None mentioned".
- "history": format as labeled key-value pairs, one per line. Use these labels where applicable:
    Medical Emergency: [the specific incident or emergency type that triggered the call. Describe the incident first, then the medical nature — e.g. "Collision - Vehicle with cyclist", "Collision - Multi-vehicle", "Cardiac event - Chest pain", "Respiratory distress - Asthma attack", "Fall from height", "Assault - Blunt trauma", "Allergic reaction - Anaphylaxis". If the incident type is unclear, describe the primary symptom instead. If nothing is known, set to "Unknown emergency"]
    Conditions: [comma-separated list of pre-existing medical conditions, or "None mentioned"]
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
      const patientData = JSON.parse(callCompletion.choices[0].message.content);
      console.log("process-call response:", patientData);

      // Step 2: Triage symptoms
      const triageCompletion = await client.chat.completions.create({
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
            content: `Triage this patient:\nProfile: ${patientData.profile}\nMedical History: ${patientData.history}\nSymptoms: ${patientData.symptoms}`,
          },
        ],
      });
      const triageData = JSON.parse(triageCompletion.choices[0].message.content);
      console.log("triage response:", triageData);

      // Step 3: Score and rank hospitals
      const hospitalList = hospitals
        .map((h) => `- ${h.HospitalName}: ${h.HospitalInfo}, ${h.HospitalNameDistance}km away, ${h.DriveTime} min drive`)
        .join("\n");

      const hospCompletion = await client.chat.completions.create({
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
            content: `Patient:\nProfile: ${patientData.profile}\nHistory: ${patientData.history}\nSymptoms: ${patientData.symptoms}\n\nHospitals:\n${hospitalList}\n\nScore and rank these hospitals for this patient.`,
          },
        ],
      });
      const { hospitals: scoredHospitals } = JSON.parse(hospCompletion.choices[0].message.content);
      console.log("recommend-hospitals response:", scoredHospitals);

      return { patientData, triageData, scoredHospitals };
    },
  },
};

// --- Server Start ---
// graphql-http is synchronous — no async startup needed.
// makeExecutableSchema combines typeDefs + resolvers into a single schema object.
const schema = makeExecutableSchema({ typeDefs, resolvers });
app.use("/graphql", createHandler({ schema }));

app.listen(8080, () => console.log("Server running on port 8080 — GraphQL at /graphql"));
