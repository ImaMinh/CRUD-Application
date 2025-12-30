from pydantic import BaseModel, Field
from typing import Optional

class Invoice(BaseModel):
    # The alias allows us to use '_id' from MongoDB but refer to it as 'id' in Python
    id: Optional[str] = Field(None, alias="_id")
    invoice_number: str
    invoice_date: str
    vendor_name: str
    vendor_address: str
    bill_to_name: str
    bill_to_address: str
    currency: str
    subtotal: str
    tax: str
    total: str
    payment_terms: str
    due_date: str

    model_config = {
        "populate_by_name": True, # Allows using both 'id' and '_id'
        "json_schema_extra": {
            "example": {
                "invoice_number": "2022445",
                "invoice_date": "2022-07-19",
                "vendor_name": "Your Business Name",
                "vendor_address": "5 Martin Pl, Sydney",
                "bill_to_name": "Your Client",
                "bill_to_address": "100 Harris St, Sydney",
                "currency": "AUD",
                "subtotal": "30",
                "tax": "N/A",
                "total": "30",
                "payment_terms": "Payment is due within 15 days",
                "due_date": "2022-08-02"
            }
        }
    }
