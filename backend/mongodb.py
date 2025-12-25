from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import json
from bson import json_util #bson is Mongodb object or something, read mongodb fastAPI integration doc to understand this


uri = "mongodb+srv://minhhanduc:13148897minh@crud-app.k2lqhn4.mongodb.net/?appName=CRUD-APP"

client = MongoClient(uri,server_api=ServerApi('1'))
db = client.get_database("crud-app")
collection = db.invoices # Create collection named 'invoices'

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
    
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
        
        print("JSON DATA: ", type(json_invoice_list))
        
        return json_invoice_list
    except Exception as e:  
        print("An error occured with get_data()")
        print(e)
    