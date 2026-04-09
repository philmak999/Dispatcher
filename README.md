# Dispatcher

AI-powered 911 dispatcher workflow reducing urgent medical response times, improving ambulance-to-hospital efficiency, and reducing ER wait times across hospitals.

## Key Features
- AI-powered information extractor from live 911 call-generated transcript
- AI-generated patient case summary and hospital routing options with AI scoring and reasoning
- Real-time voice recognition transcript verbatim. 
- Ambulance routing tied to AI reasoning with fully incorporated maps API (mapbox)
- Fully functiona 911 operator-focused UI equipped with easy access, pertinent information at the ready.

## Future additions
- Implement live hospital API data in AI reasoning
- Using more powerful and trained LLM models to provide more accurate, rapid and key-symptom suggestions on hospital destination, route, and ambulance to significantly reduce ER wait times across multiple nearby hospitals
- Improve security and validation in both AI and user handling of sensitive data. 
- HIPAA compliance

## Project Structure
- `frontend/` - React + Vite client application
- `backend/` - Express server and MySQL database
- Prompt-focused AI reasoning and information handling

## Database Import (MySQL)
The backend includes a an importer-ready code constructed for `.mysql`/`.sql` files.
