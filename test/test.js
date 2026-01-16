

/* =============================== Upload Form and DashBoard Even Handler <Start> ===============================  */

const Invoice_Form = document.getElementById('upload-invoice-form')

Invoice_Form.addEventListener('submit', formUploadImageHandler)

// helper function for file validation // 
function fileTypeValidation(fileType){
    const validFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml','application/pdf']

    return (validFileTypes.includes(fileType))
}

function formUploadImageHandler(event){ /* call-back func */
    try{
        event.preventDefault()

        /* 1. getting the file from the input element 
            / NOTE: documents to read for these: 
                - MDN DOM object: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model#dom_interfaces
                - Using Files from Web Applications: https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
                - File: https://developer.mozilla.org/en-US/docs/Web/API/File
                - FileList: https://developer.mozilla.org/en-US/docs/Web/API/FileList
            /
        */
        
        // input element
        const Invoice_Form_Input = Invoice_Form.elements.file // the file field is taken from the name field of the input

        const fileList = Invoice_Form_Input.files

        const image_file = fileList[0]

        /* 2. Validate the File Type */
        file_type_is_valid = fileTypeValidation(image_file.type)

        // -- if file type is invalid, set a validity report and return to the browser
        if(!file_type_is_valid){
            // set custom validity here  
            validity_msg = 'Invalid file type! Please upload an image or pdf'

            Invoice_Form_Input.setCustomValidity(validity_msg)
            Invoice_Form_Input.reportValidity()

            return
        }

        // -- if file type is valid, continue the process

        /* 3. Processing the image (Work on this) */

        /* 4. Make a fetch request to upload the image to the backend server */
        
        // a. create a form-data object (simplifies logic for later processes)
        const formData = new FormData()
        formData.append('file', image_file)

        const initObject = {
            method: 'POST',
            body: formData
        }

        fetch('http://127.0.0.1:8000/invoices/scanner', initObject)

    } catch(error) {
        console.log(error)
    }
}


//         if(!fileTypeValidation(fileType)){
//             const Invoice_Form_Input = document.getElementById('upload-invoice-form-input')

//             // Set the custom message
//             Invoice_Form_Input.setCustomValidity("Invalid file type! Please upload an image or pdf.");
            
//             // Trigger the bubble
//             Invoice_Form_Input.reportValidity();
            
//             return;
//         }

//         // continue process here

//         // --- image processor here --- // 

//         // asdfhasjdhlfkjahsglaheruifha wef ABSOLUTE SHIT fix this shit tmr
//         setLoading(true);

//         /* Inside your formUploadImageHandler function */

//         // 1. Wrap the file in a FormData object
//         const uploadData = new FormData();
//         const file = fileList[0]
//         uploadData.append('file', file); 

        
//         fetch("http://127.0.0.1:8000/upload/image", {
//             method: 'POST',
//             body: uploadData
//         })
//             .then((response) => response.json())
//             .then((result) => {
//                 if(result.status == "success") { // result is the json object w/ return status and the data object
//                     console.log("successfully scanned")
//                     console.log("The result: ", result)
//                     renderInvoiceForm(result.data) // get the data from the return result
//                 }
//             })
//             .catch(error => console.error(error))
//             .finally(()=> {
//                 Invoice_Form.reset()
//                 setLoading(false)
//             })

//     } catch(error) {
//         console.log(error)
//         alert('upload invoice failed: ', error)
//     }
// }

// // ///////// FIX THIS SHIT TOMMOROW
// /* --- 1. filtering the file type --- */
// function fileTypeValidation(fileType){
//     const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/pdf']

//     return validTypes.includes(fileType)
// }

// /* set form processing style helper function */
// function setLoading(loading){
//     const uploadButton = document.getElementById('upload-image-form-button')
//     uploadButton.disabled = loading;
    
//     if (loading) {
//         uploadButton.innerHTML = `
//             <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//             <span>Processing...</span>
//         `
//     } else {
//         uploadButton.innerHTML = 'Upload & Extract'
//     }
// }



/* =============================== Upload Table Even Handler <Start> ===============================*/

lineItemsTableBody = document.getElementById('upload-table-line-items-table-body')

/* ###### Upload Table Line Item Row Adder And Remover ####### */
function addLineItem(){

    // --- 1. import the template as doc-fragments and move the content (import node) --- //
    template = document.getElementById('line-item-table-row-template')

    templateDocumentFragment = template.content

    const clone = document.importNode(templateDocumentFragment, true)

    // --- 2. calculate the order of the new row ---
    let nextRowIndex = lineItemsTableBody.children.length + 1

    clone.querySelector('th').textContent = nextRowIndex

    lineItemsTableBody.appendChild(clone)
}

function removeLineItem(event){
    event.target.closest('tr').remove()

    updateRowNumbers()

    function updateRowNumbers(){
        const rows = lineItemsTableBody.querySelectorAll('tr')

        rows.forEach((row, index) => {
            row.querySelector('th').textContent = index + 1
        })
    }
}

/* ###### Upload Table Reset (Discard) Button */
function discardInvoice() {
    if(!confirm('Are you sure you want to discard the table?')){
        return
    }

    // --- 1. reset the form fields ---
    document.getElementById('upload-table-form').reset()

    // --- 2. reset the line item table --- 
    document.getElementById('upload-tabel-line-items-table-body').innerHTML = ''
    addLineItem()   
}

/* ###### Upload Table Upload Event Handler ###### */

// --- 1. get the form data from the upload table form --- // 
const uploadTableForm = document.getElementById('upload-table-form')

uploadTableForm.addEventListener('submit', function(event) {
    event.preventDefault()

    const formData = new FormData(uploadTableForm)

    serializeFormData(formData)

    // !!!!!!!!!! ##########  IMPORTANT: create an reload page handle here ############ !!!!!!!!!!!
                
                // IMPORTANT FUNCTION TO ADD
    
    if(confirm('you sure you want to submit')){ 
        // serializeFormData(formData)
        //location.reload()
    }
})

// --- 2. format the form-data data into required format  --- //
function serializeFormData(formData){

    // --- a. create the base data structure --- //
    const invoice_structure = {
        'invoice_number': formData.get('invoice_number'),
        'invoice_date': formData.get('invoice_date'),
        'vendor_name': formData.get('vendor_name'),
        'vendor_address': formData.get('vendor_address'),
        'bill_to_name': formData.get('bill_to_name'),
        'bill_to_address': formData.get('bill_to_address'),
        'currency': formData.get('currency'),
        'subtotal': formData.get('subtotal'),
        'tax': formData.get('tax'),
        'total': formData.get('total'),
        'payment_terms': formData.get('payment_terms'),
        'due_date': formData.get('due_date'),
        'line_items': []
    }

    // --- b. get equal-lengths arrays of each field; each index corresponding to one line-item; zip them into a new line-item list ---
    descriptions = formData.getAll('description')
    quantities = formData.getAll('quantity')
    unit_prices = formData.getAll('unit_price')
    amounts = formData.getAll('amount')

    // --- c. append the zipped list of line items value into invoice_structure.line_items ---
    invoice_structure.line_items = zipItemLists(descriptions, quantities, unit_prices, amounts)

    // --- zipper function to map element to new line_items list ---
    function zipItemLists(descriptions, quantities, unit_prices, amounts){
        const items = []

        for(let i = 0; i < descriptions.length; i++){
            description = replaceEmptyStringsWithNull(null, descriptions[i])
            quantity = replaceEmptyStringsWithNull(null, quantities[i])
            unit_price = replaceEmptyStringsWithNull(null, unit_prices[i])
            amount = replaceEmptyStringsWithNull(null, amounts[i])

            item = {
                'description': description,
                'quantity': quantity,
                'unit_price': unit_price,
                'amount': amount
            }

            
            // --- before appending to the list of items, check if the item is empty (all data fields are null) or not --- //
            if(filterLineItem(item) == true){
                items.push(item)
            } else {
                // !!!!!!!!!! ##########  IMPORTANT: create an alert handle here ############ !!!!!!!!!!!
                
                // IMPORTANT FUNCTION TO ADD
                
                // alert('One of your line-item is empty, remove it before you submit')
            }
        }

        return items
    }

    // --- helper function to filter out all null items --- // 
    function filterLineItem(item){
        // --- check if at least one field is non-null ---
        return (
            item.description != null && item.description.trim() != "" ||
            item.quantity != null || 
            item.unit_price != null ||
            item.amount != null
        )
    }

    // --- helper function to replace empty strings with null
    function replaceEmptyStringsWithNull(key, value){
        if(value === ""){
            return null
        } 
        return value
    }

    console.log(JSON.stringify(invoice_structure, replaceEmptyStringsWithNull, 2))
}

/* =============================== Upload Table Even Handler <END> ===============================*/