
# import scanner from backend folder
# Note: we cannot import modules like this in python from './../backend/scanner.py' import analyze_invoice
from test.scanner_test import extract_invoice 

# import FastAPI modules 
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware  

# import Pydantic model:
from test.test_models import ExtractedInvoiceModel, UserUploadInvoice, UploadedDBInvoice

# import Pydantic Validation Error:
from pydantic import ValidationError

# import MongoDB handler codes:
from backend.mongodb import insert_invoice, get_data, update_invoice

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
    allow_methods = ['*'], # allows all methods, defaults to only 'GET' if not specified
    allow_headers = ['*'] # clarify this later
)

# === API for upload invoice image to Gemini === #
@app.post('/invoices/scanner')
async def uploadFormImage(file: UploadFile):
    """
        Receives an invoice and performs OCR analysis to extract data
        """
    try:
        print(file)
        
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
        
        # print(response)
        
        validated_model = ExtractedInvoiceModel.model_validate_json(response)
        
        response = validated_model.model_dump_json(indent=2)
        
        # print('response: \n', response)
               
        # --- if all are confirmed, return the json data --- # 
        return response
    
    except ValidationError as validationError: 
        print('Validation error occured', validationError) 
        # return something here
    
    except Exception as error:
        print('Exception occured: ', error)
        # return an error to display here
      
      
# === API for uploading new invoice data to MongoDB === #
@app.post('/uploaded/invoices')
async def uploadInvoiceData(data: UserUploadInvoice):
    """
    Handler for uploading new invoices to MongoDB
    """
    try:
        # 1. Validate the Data received 
        validated_invoice = UserUploadInvoice.model_validate(data)
        
        validated_invoice = validated_invoice.model_dump_json()
        
        # 2. Insert the Invoice
        insert_invoice(json.loads(validated_invoice))
    except ValidationError as validation_error:
        print("A validation error occurred in uploadInvoiceData(): ", validation_error)
    except Exception as error:
        print("An Error occured in uploadInvoiceData(): ", error)
    
    
    
# === API for getting uploaded invoices === #
@app.get('/uploaded/invoices')
async def getUploadedInvoices():
    """
    Hanlder to get Uploaded Mongo data
    
    :param data: Description
    :type data: UploadedDBInvoice
    """
    try:
        invoices = get_data()
        # print('invoices: \n', invoices)
        return invoices
    except Exception as error:
        print("An Error occured in getUploadedInvoices(): ", error)
     
    
      
# === API for updating Edited Invoice === #
@app.put('/uploaded/invoices/{invoice_id}')
async def updateUploadedInvoice(updatedData: UploadedDBInvoice, invoice_id: str):
    """
    Handler for updating existed invoices
    
    :param updatedData: Description
    :type updatedData: UploadedDBInvoice
    :param invoice_id: Description
    :type invoice_id: str
    """
    try:
        # --- validation happened automatically for the incoming json before the code runs --- #
        
        # --- 1. convert model to dictionary for MongoDB --- #
        updated_invoice_dictionary = updatedData.model_dump()
        
        # --- 2. update the data --- # 
        update_result =  update_invoice(invoice_id, updated_invoice_dictionary)
        
        # --- 3. Return success response --- #
        
        # TODO: fix this, this is not working
        if (update_result == True):
            return {
                "status": "success",
                "message": f"Invoice {invoice_id} updated successfully",
                "updated_data": updated_invoice_dictionary
            }
        else:
            return {
                "status": "error",
                "ok": False,
            }
            
    except ValidationError as validation_error:
        print("Validation error in updateUploadedInvoice():", validation_error)
        return {
            "status": "error",
            "message": "Invalid data format",
            "errors": validation_error.errors()
        }
    
    except Exception as error:
        print("An Error occured in updateUploadedInvoice(): ", error)
        
        
        
# Notes: Implement the Dependencies and Credentials later
    
    