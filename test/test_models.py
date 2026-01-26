from pydantic import BaseModel, model_validator
from typing import Optional, TypeVar, Generic, List
from datetime import date   
import math

# ================== Model for extracted invoice response from Gemini ================== # 

# - Define a Generic TypeVar (Pydantic needs concrete-types for validation)
T = TypeVar("T")

# -- model for each extracted data field  -- 
class ExtractedField(BaseModel, Generic[T]):
    value: Optional[T]
    confidence: float
    warning_flags: List[str] = []

# -- model for extracted line-items -- 
class ExtractedLineItem(BaseModel):
    description: ExtractedField[str]
    quantity: ExtractedField[int]
    unit_price: ExtractedField[float]
    amount: ExtractedField[float]

# --- define the model for Gemini returned response --- 
class ExtractedInvoiceModel(BaseModel):
    invoice_number: ExtractedField[str]
    invoice_date: ExtractedField[date]
    vendor_name: ExtractedField[str]
    vendor_address: ExtractedField[str]
    bill_to_name: ExtractedField[str]
    bill_to_address: ExtractedField[str]
    currency: ExtractedField[str]
    subtotal: ExtractedField[float]
    tax: ExtractedField[float]
    total: ExtractedField[float]
    payment_terms: ExtractedField[str]
    due_date: ExtractedField[date]
    line_items: List[ExtractedLineItem]
    
    # -- custom validator for cross-field validation -- #
    # Note: docs: https://docs.pydantic.dev/latest/concepts/validators/#using-the-decorator-pattern:~:text=exist%20on%20subclasses.-,Model%20validators,-%C2%B6
    @model_validator(mode='after') # clarify the type of mode later
    def check_for_null_and_evaluate_confidence(self):
        for field, value in self: 
            if(field == 'line_items'):
                if(value is None): value = []
                check_line_item_math(value)
            else:
                if(value.value == None):
                    # initialize warning flags if missing
                    if(value.warning_flags is None):
                        value.warning_flags = [] 
                    value.warning_flags.append('missing_value')
                elif ((value.confidence != None) and (value.confidence < 0.8 )):
                    if(value.warning_flags != None):
                        value.warning_flags.append('low_confidence')
        
        # check for grand_total math mismatch after validating line_items values
        tax_amount = self.tax.value
        grand_total_amount = self.total.value
        
        if(tax_amount is not None and grand_total_amount is not None):
            
            calculated_grand_total = 0
            
            for item_model in self.line_items:
                
                amount = item_model.amount
                
                if(('math_mismatch' in amount.warning_flags) or (amount.value is None)):
                    break
                
                calculated_grand_total += amount.value
            
            calculated_grand_total += tax_amount
            
            if(grand_total_amount != calculated_grand_total):
                if(self.total.warning_flags is None): self.total.warning_flags = []
                self.total.warning_flags.append('math_mismatch')
            
                
        return self

def check_line_item_math(line_items: List[ExtractedLineItem]):
    def check_for_nullity_and_confidence(field: ExtractedField) -> None:
        # if field is null
        if(field.value == None):
            if(field.warning_flags != None):
                field.warning_flags.append('missing_value')
            
        # if field has low-confidence
        elif ((field.confidence != None) and (field.confidence < 0.8)):
            field.warning_flags.append('low_confidence')

    
    for item_model in line_items:
        # accessing the fields
        description = item_model.description    
        quantity = item_model.quantity
        unit_price = item_model.unit_price
        amount = item_model.amount
        
        # 
        no_null_number_fields = True
        
        # --- 1. check for description nullity --- # 
        check_for_nullity_and_confidence(description)
        
        # --- 2. check for quantity nullity --- # 
        check_for_nullity_and_confidence(quantity)
        
        # --- 3. check for unit_price nullity --- # 
        check_for_nullity_and_confidence(unit_price)
        
        # --- 4. check for amount nullity --- # 
        check_for_nullity_and_confidence(amount)
        
        if(amount.value is not None and 
            unit_price.value is not None and 
            quantity.value is not None):
            
            expected_value = unit_price.value * quantity.value

            if(amount.value != expected_value):
                # initialize if missing warning flags
                if amount.warning_flags is None:
                    amount.warning_flags = [] 
                
                amount.warning_flags.append('math_mismatch')
        
        elif(unit_price.value is None or quantity.value is None):
            if amount.warning_flags is None:
                    amount.warning_flags = [] 
                
            amount.warning_flags.append('math_mismatch')    
        
        

    





# ================== Model for User Upload Invoice ================== #

class LineItem(BaseModel):
    description: Optional[str]
    quantity: Optional[int]
    unit_price: Optional[float]
    amount: Optional[float]


class UserUploadInvoice(BaseModel):
    invoice_number: Optional[str]
    invoice_date: Optional[date]
    vendor_name: Optional[str]
    vendor_address: Optional[str]
    bill_to_name: Optional[str]
    bill_to_address: Optional[str]
    currency: Optional[str]
    subtotal: Optional[float]
    tax: Optional[float]
    total: Optional[float]
    payment_terms: Optional[str]
    due_date: Optional[date]
    line_items: List[Optional[LineItem]]
        
        

    




    
# ================== Model for Uploaded Invoice Stored in MongoDB ================== #

class UploadedDBInvoice(UserUploadInvoice):
    id: Optional[str] = None
