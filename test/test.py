
# import scanner from backend folder
# Note: we cannot import modules like this in python from './../backend/scanner.py' import analyze_invoice
from test.scanner_test import extract_invoice 

# import FastAPI modules 
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware  

# import Pydantic model:
from test.test_models import ExtractedInvoiceModel

# import Pydantic Validation Error:
from pydantic import ValidationError

# import validator function: 
#from test.validator_test import validateGeminiResponse

# import json: 
import json

# import pprint
from pprint import pprint


# --- initiate the application ---
app = FastAPI()


# configure CORS networks #
allowed_origins = ['http://127.0.0.1:5500']

# configure the app middle ware (traffic control layer (ASGI specification)) #
app.add_middleware(
    CORSMiddleware,
    allow_origins = allowed_origins,
    allow_headers = ['*'] # clarify this later
)


@app.post('/invoices/scanner')
async def uploadFormImage(file: UploadFile):
    """
        Receives an invoice and performs OCR analysis to extract data
        """
    try:
        
        
        # get the mime-type of the image
        mime_type = str(file.content_type)
        
        # get the bytes of the image??? /*** clarify this ***/
        
        print('file =', file)
        
        # pre-process the image here
        # pre-process image function
        
        # convert the image into bytes
        img_bytes = await file.read()
        
        # send it to the scanner
        response = extract_invoice(img_bytes, mime_type) # why can't this be an await function?

        # validate the response data
        # --- check for schema completeness, valid json structure, and type formatting (non-strict) --- #
        
        # --- validate json structure --- # 
        try: 
            # try converting the gemini response into json obj
            response = json.dumps(response)
            response = json.loads(response)
        except: 
            raise ValueError('Gemini Response is not JSON parsable')
        
        print(response)
        
        validated_model = ExtractedInvoiceModel.model_validate_json(response)
        
        response = validated_model.model_dump_json(indent=2)
        
        print('response: \n', response)
               
        # --- if all are confirmed, return the json data --- # 
        return response
    
    except ValidationError as validationError: 
        print('Validation error occured', validationError) 
        # return something here
    
    except Exception as error:
        print('Exception occured: ', error)
        # return an error to display here
    
    
    