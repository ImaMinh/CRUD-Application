import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from fastapi import HTTPException
import json
from bson import json_util, ObjectId #bson is Mongodb object or something, read mongodb fastAPI integration doc to understand this
from backend.creds import MONGO_ATLAS_PASSWORD
from datetime import datetime, date

# Search for the env value named MONGO_URI
uri = os.getenv("MONGO_URI")

if(not uri):
    uri = f"mongodb+srv://minhhanduc:{MONGO_ATLAS_PASSWORD}@crud-app.k2lqhn4.mongodb.net/?appName=CRUD-APP"

users = MongoClient(uri,server_api=ServerApi('1')) # Same CLI command 

# Code to check connectivity to remote cluster
try:
    users.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print("Connection to Mongo error: ", e)


db = users.get_database("crud-app")
# get the collection
# collection type = <class 'pymongo.synchronous.collection.Collection'>
collection = db.invoices 

# #### Inserting Invoice ####
def insert_invoice(data):
    try:
        if(data): 
            result = collection.insert_one(data)
            print("document insertion success")
            
        return str(result.inserted_id)
    except Exception as e:
        print("ERROR OCCURED in insert_invoice: ", e)


def get_data():    
    try:
        cursor = collection.find() # MongoDB cursor Obj
        
        # convert MongoDB cursor obj into a dictionary
        cursor_list = [invoice for invoice in cursor]
        json_invoice_list = json.loads(json_util.dumps(cursor_list)) # must use bson to serialize ObjectID field in cursor list
        
        return json_invoice_list    
    
    except Exception as e:  
        print("An error occured with get_data()")
        print(e)


# ====== Function for Updating Invoice ======
def update_invoice(invoiceID: str, updated_data: dict):
    """
    mongodb.py's module's function for updating existing data
    
    :param invoiceID: Description
    :type invoiceID: str
    :param updated_data: Description
    :type updated_data: dict
    """
    try:
        # Debug: Print what we received
        print(f"Received invoice_id: {invoiceID}, type: {type(invoiceID)}")
        
        # Ensure invoice_id is a string
        if not isinstance(invoiceID, str):
            print(f"ERROR: invoice_id is not a string, it's {type(invoiceID)}")
            return False
        
        try:
            object_id = ObjectId(invoiceID)
        except Exception as e:
            print(f"ERROR: Invalid ObjectId format: {invoiceID}")
            print(f"Error details: {e}")
            return False
        
        # --- remove _id from update data if it exists (can't update _id field) ---
        if '_id' in updated_data:
            del updated_data['_id']
        
        # # --- Convert date objects to datetime recursively (MongoDB doesn't support date) (GEMINI CODE)---
        # def convert_dates_to_datetime(obj):
        #     """Recursively convert date objects to datetime in dict/list structures"""
        #     if isinstance(obj, dict):
        #         return {k: convert_dates_to_datetime(v) for k, v in obj.items()}
        #     elif isinstance(obj, list):
        #         return [convert_dates_to_datetime(item) for item in obj]
        #     elif isinstance(obj, date) and not isinstance(obj, datetime):
        #         return datetime.combine(obj, datetime.min.time())
        #     else:
        #         return obj
        
        # updated_data = convert_dates_to_datetime(updated_data)
        
        # --- update the document --- #
        update_result = collection.update_one(
            {"_id": object_id},
            {"$set": updated_data}
        )
        
        # --- return update result --- #
        if update_result.matched_count > 0:
            print(f"Invoice {invoiceID} updated successfully")
            return True
        else:
            print(f"Invoice {invoiceID} not found")
            return False
        
    except Exception as error:
        print(f"exception occured in mongo.py update_invoice(): {error}")
        return False
    
    
def delete_invoice(id):
    try: 
        obj_id = ObjectId(id)
        
        result = collection.delete_one({"_id": obj_id})
        
        if result.acknowledged and result.deleted_count == 1:
            return {"status": "success", "message": "Invoice deleted successfully"}  
        else:
            raise HTTPException(status_code=404, detail=f"Invoice with ID {id} not found")
    except Exception as e: 
        print(f"Error in delete_invoice: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e)) 