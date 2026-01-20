# import the api
from google import genai
from google.genai import types

# import the api key
from backend.creds import gemini_api

# import the extract invoice json schema 
from test.test_models import ExtractedInvoiceModel

# other libraries
import json

# ---- Initialize the client ---- #
client = genai.Client(api_key=gemini_api)


# ---- Invoice Extraction Prompt ---- # 
INVOICE_EXTRACTION_PROMPT = """
    You are an invoice extraction engine.
    Extract invoice data from the provided document.
    Return ONLY valid JSON that matches the schema below. Do not use markdown and no explanation.

    ## Rules
    - If a field is not found, use null.
    - Keep dates in ISO format: YYYY-MM-DD when possible.
    - Amounts must be numbers (no currency symbols). If currency exists, put it in currency.
    - If there are line items, extract them; otherwise use an empty array.
    - Provide confidence from 0.0 to 1.0 for each top-level field and each line item field.
    - return response in JSON format [{}]

    ## JSON Schema
    {
        "invoice_number":   {'value': string|null, 'confidence': float}
        "invoice_date":     {'value': string|null, 'confidence': float}
        "vendor_name":      {'value': string|null, 'confidence': float}
        "vendor_address":   {'value': string|null, 'confidence': float}
        "bill_to_name":     {'value': string|null, 'confidence': float}
        "bill_to_address":  {'value': string|null, 'confidence': float}
        "currency":         {'value': string|null, 'confidence': float}
        "subtotal":         {'value': float|null, 'confidence': float}
        "tax":              {'value': float|null, 'confidence': float}
        "total":            {'value': float|null, 'confidence': float}
        "payment_terms":    {'value': string|null, 'confidence': float}
        "due_date":         {'value': string|null, 'confidence': float}
        "line_items": [
            {
                "description": {'value': string|null, 'confidence': float}
                "quantity":    {'value': int|null, 'confidence': float}
                "unit_price":  {'value': float|null, 'confidence': float}
                "amount":      {'value': float|null, 'confidence': float}                
            }
        ]
    }
"""

INVOICE_EXTRACTION_PROMPT.strip()


# ---- Extraction Function ---- # 
def extract_invoice(img_bytes: bytes, mime_type: str):
    try: 
        # get raw binaries from the img bytes
        bits = types.Part.from_bytes(
            data = img_bytes,
            mime_type = mime_type
        )
        
        # get the required json structure
        json_schema = ExtractedInvoiceModel.model_json_schema()
        
        # request the response
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=[bits, INVOICE_EXTRACTION_PROMPT],
            config={
                "response_mime_type": "application/json",
                "response_json_schema": json_schema
            }
        )
        
        # if success and response != null, return response
        if(response.text):    
            # print('Gemini API extraction returns: ', response.text)
            return response.text
        else:
            return None
    
    except Exception as error: 
        print(f'An error: {{{error}}} occurect in ocr scanner')
        return error
        