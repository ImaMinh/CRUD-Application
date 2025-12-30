##### FastAPI Endpoint #####
# import sys
# import os
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import json

from fastapi import FastAPI, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware

from scanner import analyze_invoice
from models import Invoice
from mongodb import insert_invoice, get_data, update_invoice, delete_invoice

app = FastAPI()

# allowed origins for CORS
origins = [
    "http://127.0.0.1:5500"
]

#### adding CORS validation to routes ####
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Allows specified origins
    allow_credentials=True,         # Allows cookies to be included in cross-origin requests
    allow_methods=["*"],            # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],            # Allows all headers
)

# Posting data to scanner.py
@app.post("/upload/image")
async def create_upload_file(file: UploadFile):
    print(f"File received: {file.filename}")
    image_bytes = await file.read() 
    scanning_result = analyze_invoice(image_bytes, str(file.content_type))
    return {"status": scanning_result["status"], "data": scanning_result["json_data"]}
    
# API for uploading data to MongoDB
@app.post("/upload/json_form_data/")
async def upload_data_to_db(data: str = Body(...)):
    
    invoice_dict = json.loads(data)
    
    inserted_id = insert_invoice(invoice_dict)
    
    print(f"data received: ", data)
    return ("successfully received")

# Route for getting data from MongoDB
@app.get("/mongo_data/")
async def get_mongo_data():
    try:    
        invoices = get_data()
        print("data retrieve sucessfully", type(invoices))
        return invoices
    except Exception as e:
        print("An error occured with get_mongo_data()")
        print(e)
        
@app.put("/update_data/{invoice_id}")
async def update_mongo_data(invoice_id: str, new_invoice: Invoice):
    try:
        # Our new_invoice is a Pydantic model and not a valid MongoDB BSON, therefore, we must convert it to be able to update the document
        update_data = new_invoice.model_dump(by_alias=True, exclude_unset=True)

        # _id field in mongodb is immutable, therefore we must exclude this from our data to be able to update it
        if "_id" in update_data:
            del update_data["_id"]
        
        print("ud: ", update_data)
        
        result = update_invoice(invoice_id, update_data)
        
        return result
    except Exception as e:
        print(e)
        
@app.delete("/delete_data/{invoice_id}")
async def delete_mongo_data(invoice_id: str):
    try: 
        result = delete_invoice(invoice_id)
        
        return result
    except Exception as e:
        print(e)
