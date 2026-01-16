from pydantic import BaseModel
from typing import Optional, TypeVar, Generic, List
from datetime import datetime

# ================== Model for extracted invoice response from Gemini ================== # 

# - Define a Generic TypeVar (Pydantic needs concrete-types for validation)
T = TypeVar("T")

# -- model for each extracted data field  -- 
class ExtractedField(BaseModel, Generic[T]):
    value: Optional[T]
    confidence: float

# -- model for extracted line-items -- 
class ExtractedLineItem(BaseModel):
    description: ExtractedField[str]
    quantity: ExtractedField[int]
    unit_price: ExtractedField[float]
    amount: ExtractedField[float]

# --- define the model for Gemini returned response --- 
class ExtractedInvoiceModel(BaseModel):
    invoice_number: ExtractedField[str]
    invoice_date: ExtractedField[datetime]
    vendor_name: ExtractedField[str]
    vendor_address: ExtractedField[str]
    bill_to_name: ExtractedField[str]
    bill_to_address: ExtractedField[str]
    currency: ExtractedField[str]
    subtotal: ExtractedField[float]
    tax: ExtractedField[float]
    total: ExtractedField[float]
    payment_terms: ExtractedField[str]
    due_date: ExtractedField[datetime]
    line_items: List[ExtractedLineItem]





# ================== Model for User Upload Invoice ================== #

class LineItem(BaseModel):
    description: Optional[str]
    quantity: Optional[int]
    unit_price: Optional[float]
    amount: Optional[float]


class UserUploadInvoice(BaseModel):
    id: str
    invoice_number: Optional[datetime]
    invoice_date: Optional[datetime]
    vendor_name: Optional[str]
    vendor_address: Optional[str]
    bill_to_name: Optional[str]
    bill_to_address: Optional[str]
    currency: Optional[str]
    subtotal: Optional[float]
    tax: Optional[float]
    total: Optional[float]
    payment_terms: Optional[str]
    due_date: Optional[datetime]
    line_items: List[Optional[LineItem]]
    
