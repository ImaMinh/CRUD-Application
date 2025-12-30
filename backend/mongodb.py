from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from fastapi import HTTPException
import json
from bson import json_util, ObjectId #bson is Mongodb object or something, read mongodb fastAPI integration doc to understand this


uri = "mongodb+srv://minhhanduc:13148897minh@crud-app.k2lqhn4.mongodb.net/?appName=CRUD-APP"

users = MongoClient(uri,server_api=ServerApi('1')) # Same CLI command 
db = users.get_database("crud-app")
# get the collection
# collection type = <class 'pymongo.synchronous.collection.Collection'>
collection = db.invoices 

# # Code to check connectivity to remote cluster
# try:
#     users.admin.command('ping')
#     print("Pinged your deployment. You successfully connected to MongoDB!")
# except Exception as e:
#     print(e)


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
        
def update_invoice(id, new_invoice_data):
    try:
        obj_id = ObjectId(id)
        
        result = collection.update_one({"_id": obj_id}, {"$set": new_invoice_data})
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail=f"Invoice with ID {id} not found")
        
        print("invoice updated successfully")
        
        return {"status": "success", "message": "Invoice updated successfully"}  
        
    except Exception as e:
        print("exception occured in update_invoice(): \n", e)
        
        