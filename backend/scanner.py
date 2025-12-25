from google import genai
from google.genai import types
import json


# ----- Needs fixing this, no explicit key -------
client = genai.Client(api_key="AIzaSyDOepWVtBc4pNwIGoY-qnN4XogG01Ok7Po")


# Prompt # 
INVOICE_EXTRACTION_PROMPT = """
You are an invoice extraction engine.
Extract invoice data from the provided document.
Return ONLY valid JSON that matches the schema below. No markdown, no explanation.

## Rules
- If a field is not found, use null.
- Keep dates in ISO format: YYYY-MM-DD when possible.
- Amounts must be numbers (no currency symbols). If currency exists, put it in currency.
- If there are line items, extract them; otherwise use an empty array.
- Provide confidence from 0.0 to 1.0 for each top-level field and each line item field.
- Make the response JSON parsable for JavaScript

## JSON Schema
{
    "invoice_number":   {"value": string|null},
    "invoice_date":     {"value": string|null},
    "vendor_name":      {"value": string|null},
    "vendor_address":   {"value": string|null},
    "bill_to_name":     {"value": string|null},
    "bill_to_address":  {"value": string|null},
    "currency":         {"value": string|null},
    "subtotal":         {"value": number|null},
    "tax":              {"value": number|null},
    "total":            {"value": number|null},
    "payment_terms":    {"value": string|null},
    "due_date":         {"value": string|null},
    "line_items": [
            {
                "description": { "value": string|null},
                "quantity":    { "value": number|null},
                "unit_price":  { "value": number|null},
                "amount":      { "value": number|null}
            }
        ],
}
""".strip()

######### Main Excution ######### 

def analyze_invoice(image_bytes, mime_type: str):
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type,
            ),
            INVOICE_EXTRACTION_PROMPT
        ]
    )
    
    cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
    
    json_data = json.loads(cleaned_text)
    
    print(json_data)
    
    return {"status": "success", "json_data": json_data}
    