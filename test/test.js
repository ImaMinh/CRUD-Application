// -- miscalleneous variables --- // 

const ports = {
    'debug_port': 4000,
    'main_port': 8000
}
const isDebug = false


// --- Invoice Form Element --- // 
const Invoice_Form = document.getElementById('upload-invoice-form')

// --- Upload Table Form Element --- // 
const Upload_Table_Form = document.getElementById('upload-table-form')



/* =============================== Upload Form and DashBoard Even Handler <Start> ===============================  */


Invoice_Form.addEventListener('submit', formUploadImageHandler)

// ============== helper function for file validation ==============// 
function fileTypeValidation(fileType){
    const validFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml','application/pdf']

    return (validFileTypes.includes(fileType))
}

/* ============== parsing extracted data into upload-table handlers ==============*/

// -- function to parse line items --
function parseLineItems(line_items){
    // reset the table first 
    const lineItemsTable = document.getElementById('upload-table-line-items-table-body')
    lineItemsTable.innerHTML = ``
    

    if(line_items.length == 0){
        // do smt here
    } else {
        for(line_item of line_items){
            let description = line_item.description.value
            let quantity = line_item.quantity.value
            let unit_price = line_item.unit_price.value
            let amount = line_item.amount.value

            // --- import the template as doc-fragments and move the content (import node) --- //
            template = document.getElementById('line-item-table-row-template')

            templateDocumentFragment = template.content

            const clone = document.importNode(templateDocumentFragment, true)

            const description_input_element = clone.querySelector('[name="description"]')
            const quantity_input_element = clone.querySelector('[name="quantity"]')
            const unit_price_input_element = clone.querySelector('[name="unit_price"]')
            const amount_input_element = clone.querySelector('[name="amount"]')

            name_value_map = {
                'description': description, 
                'quantity': quantity,
                'unit_price': unit_price, 
                'amount': amount 
            }

            input_elements = [description_input_element, quantity_input_element, unit_price_input_element, amount_input_element]

            for(input_element of input_elements){
                extracted_value = name_value_map[input_element.name]

                if(extracted_value != null){
                    input_element.value = extracted_value
                } else {
                    input_element.value = ''
                }
            }

            
            lineItemsTable.appendChild(clone) 
        }
    }
}

// -- function to parse non-line items -- 
function parseNoneLineItems(extracted_data){
    let invoice_number = extracted_data.invoice_number
    let invoice_date = extracted_data.invoice_date
    let vendor_name = extracted_data.vendor_name
    let vendor_address = extracted_data.vendor_address
    let bill_to_name = extracted_data.bill_to_name
    let bill_to_address = extracted_data.bill_to_address
    let currency = extracted_data.currency
    let subtotal = extracted_data.subtotal
    let tax = extracted_data.tax
    let total = extracted_data.total
    let payment_terms = extracted_data.payment_terms
    let due_date = extracted_data.due_date

    // -- get list of inputs -- //
    const node_list = Upload_Table_Form.querySelectorAll('input')
    const input_element_array = Array.from(node_list)

    const field_value_map = {
        'invoice-number': invoice_number,
        'invoice-date': invoice_date,
        'vendor-name': vendor_name,
        'vendor-address': vendor_address,
        'bill-to-name': bill_to_name,
        'bill-to-address': bill_to_address,
        'currency': currency,
        'subtotal': subtotal,
        'tax': tax,
        'grand-total': total,
        'payment-terms': payment_terms,
        'due-date': due_date 
    }
    
    // parsing for non-line items
    for(input_element of input_element_array){
        extracted_field = field_value_map[input_element.id]
        
        if(extracted_field != null){
            value = extracted_field.value 
            
            if(value == null){
                if(input_element.type == 'date'){
                    continue
                } else {
                    input_element.value = ''
                }
            } else {
                input_element.value = value
            }
        }
    }
}

// --- function for parsing returned extracted invoice data into upload table fields --- //
function parseExtractedData(extracted_data){
    
    /// must enforce return value to be dictionary here
    console.log('parsed extracted data: ', extracted_data)
    if(typeof(extracted_data) != 'object'){
        console.log(typeof(extracted_data))
        console.log('type not json, return')
    }

    parseNoneLineItems(extracted_data)
    parseLineItems(extracted_data.line_items)
}


/* ============== rendering extraction dashboard handler ============== */
function renderExtractionDashboard(extractionData, responseTime){
    // Get the dashboard body container
    const dashboardBody = document.getElementById('dashboard-table-body')
    
    // Clear existing content
    dashboardBody.innerHTML = '';
    
    // Define the fields to display (in order)
    const fields = [
        'invoice_number',
        'invoice_date',
        'vendor_name',
        'vendor_address',
        'bill_to_name',
        'bill_to_address',
        'currency',
        'subtotal',
        'tax',
        'total',
        'payment_terms',
        'due_date',
        'line_items'
    ];
    
    // Loop through each field and create the row
    fields.forEach(fieldName => {
        if (extractionData.hasOwnProperty(fieldName)) {
            const fieldData = extractionData[fieldName];
            const confidence = fieldData.confidence || 0;
            const confidencePercent = Math.round(confidence * 100);
            
            // Create the row element
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row align-items-center mb-1';
            
            // Create the field key column
            const keyDiv = document.createElement('div');
            keyDiv.className = 'extraction-field-key col-3 p-0 ps-4';
            keyDiv.style.fontSize = '14px';
            keyDiv.innerHTML = `<span class="fw-bold">${fieldName}</span>`;
            
            // Create the confidence column
            const confidenceDiv = document.createElement('div');
            confidenceDiv.className = 'extraction-field-confidence col-9 p-0';
            
            // Determine progress bar color based on confidence
            let progressBarClass = 'progress-bar';
            if (confidencePercent >= 90) {
                progressBarClass += ' bg-success';
            } else if (confidencePercent >= 70) {
                progressBarClass += ' bg-info';
            } else if (confidencePercent >= 50) {
                progressBarClass += ' bg-warning';
            } else {
                progressBarClass += ' bg-danger';
            }
            
            confidenceDiv.innerHTML = `
                <div class="progress">
                    <div class="${progressBarClass}" style="width: ${confidencePercent}%"> ${confidencePercent}%</div>
                </div>
            `;
            
            // Append to row
            rowDiv.appendChild(keyDiv);
            rowDiv.appendChild(confidenceDiv);
            
            // Append row to dashboard body
            dashboardBody.appendChild(rowDiv);
        }
    });

    // Handle line_items separately - render each item as its own row
    if (extractionData.hasOwnProperty('line_items') && Array.isArray(extractionData.line_items)) {
        extractionData.line_items.forEach((lineItem, index) => {
            const itemNumber = index + 1;
            const fields = ['description', 'quantity', 'unit_price', 'amount'];
            
            fields.forEach(field => {
                if (lineItem[field]) {
                    const confidence = lineItem[field].confidence || 0;
                    const confidencePercent = Math.round(confidence * 100);
                    
                    // Create the row element
                    const rowDiv = document.createElement('div');
                    rowDiv.className = 'row align-items-center mb-1';
                    
                    // Create the field key column
                    const keyDiv = document.createElement('div');
                    keyDiv.className = 'extraction-field-key col-3 p-0 ps-4';
                    keyDiv.style.fontSize = '14px';
                    keyDiv.innerHTML = `<span class="fw-bold">${field}_${itemNumber}</span>`;
                    
                    // Create the confidence column
                    const confidenceDiv = document.createElement('div');
                    confidenceDiv.className = 'extraction-field-confidence col-9 p-0';
                    
                    // Determine progress bar color based on confidence
                    let progressBarClass = 'progress-bar';
                    if (confidencePercent >= 90) {
                        progressBarClass += ' bg-success';
                    } else if (confidencePercent >= 70) {
                        progressBarClass += ' bg-info';
                    } else if (confidencePercent >= 50) {
                        progressBarClass += ' bg-warning';
                    } else {
                        progressBarClass += ' bg-danger';
                    }
                    
                    confidenceDiv.innerHTML = `
                        <div class="progress">
                            <div class="${progressBarClass}" style="width: ${confidencePercent}%"> ${confidencePercent}%</div>
                        </div>
                    `;
                    
                    // Append to row
                    rowDiv.appendChild(keyDiv);
                    rowDiv.appendChild(confidenceDiv);
                    
                    // Append row to dashboard body
                    dashboardBody.appendChild(rowDiv);
                }
            });
        });
    }
    
    // Update response time in footer
    const responseTimeElement = document.querySelector('.row.border-top.border-dark');
    if (responseTimeElement) {
        responseTimeElement.innerHTML = `response time: <span class="fw-bold">${responseTime}s</span>`;
    }
}


async function formUploadImageHandler(event){ /* call-back func, understand how to do async await later */
    if (isDebug) {
        event.preventDefault()
        
        // debug code here
        let dummyData = `{
            "invoice_number": {
                "value": "20B05227",
                "confidence": 1.0,
                "warning_flags": []
            },
            "invoice_date": {
                "value": "2020-02-20",
                "confidence": 1.0,
                "warning_flags": []
            },
            "vendor_name": {
                "value": "Anatpath",
                "confidence": 1.0,
                "warning_flags": []
            },
            "vendor_address": {
                "value": "120 Gardenvale Road Gardenvale Vic 3186",
                "confidence": 1.0,
                "warning_flags": []
            },
            "bill_to_name": {
                "value": null,
                "confidence": 0.0,
                "warning_flags": [
                    "missing_value"
                ]
            },
            "bill_to_address": {
                "value": null,
                "confidence": 0.0,
                "warning_flags": [
                    "missing_value"
                ]
            },
            "currency": {
                "value": "AUD",
                "confidence": 0.9,
                "warning_flags": []
            },
            "subtotal": {
                "value": 230.0,
                "confidence": 1.0,
                "warning_flags": []
            },
            "tax": {
                "value": 0.0,
                "confidence": 1.0,
                "warning_flags": []
            },
            "total": {
                "value": 230.0,
                "confidence": 1.0,
                "warning_flags": []
            },
            "payment_terms": {
                "value": "If this Account is Paid Within 21 Days from the Date of Invoice a Discount of $50.00 Will Apply.",
                "confidence": 1.0,
                "warning_flags": []
            },
            "due_date": {
                "value": null,
                "confidence": 0.0,
                "warning_flags": [
                    "missing_value"
                ]
            },
            "line_items": [
                {
                    "description": {
                        "value": null,
                        "confidence": 0.0,
                        "warning_flags": [
                            "missing_value"
                        ]
                    },
                    "quantity": {
                        "value": 1,
                        "confidence": 0.8,
                        "warning_flags": []
                    },
                    "unit_price": {
                        "value": 160.0,
                        "confidence": 1.0,
                        "warning_flags": []
                    },
                    "amount": {
                        "value": 160.0,
                        "confidence": 1.0,
                        "warning_flags": []
                    }
                },
                {
                    "description": {
                        "value": null,
                        "confidence": 0.0,
                        "warning_flags": [
                            "missing_value"
                        ]
                    },
                    "quantity": {
                        "value": 1,
                        "confidence": 0.8,
                        "warning_flags": []
                    },
                    "unit_price": {
                        "value": 20.0,
                        "confidence": 1.0,
                        "warning_flags": []
                    },
                    "amount": {
                        "value": 20.0,
                        "confidence": 1.0,
                        "warning_flags": []
                    }
                },
                {
                    "description": {
                        "value": "Prompt Payment Saving",
                        "confidence": 1.0,
                        "warning_flags": []
                    },
                    "quantity": {
                        "value": 1,
                        "confidence": 0.8,
                        "warning_flags": []
                    },
                    "unit_price": {
                        "value": 50.0,
                        "confidence": 1.0,
                        "warning_flags": []
                    },
                    "amount": {
                        "value": 50.0,
                        "confidence": 1.0,
                        "warning_flags": []
                    }
                }
            ]
        }`

        console.log('1.', typeof(dummyData))

        dummyData = JSON.parse(dummyData)

        console.log('2.', typeof(dummyData))
        
        // parseExtractedData(dummyData);
        renderExtractionDashboard(dummyData, '30.3s')
        
        return;
    }

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

        // set the timer
        const startTime = performance.now();

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

        // -- set running port: for debug_port: 4000, for main_port: 8000 --
        const port = ports['main_port']
        const url = `http://127.0.0.1:${port}/invoices/scanner`

        try{
            const response = await fetch(url, initObject) // await automatically opens the response from the promise

            // End timing after receiving response
            const endTime = performance.now()
            const responseTime = (endTime - startTime) / 1000 // Convert milliseconds to seconds

            // this part is SO BUNS 
            if(response.ok){
                (response.json()).then( // accessing the json data within the promise. Clarify this later
                    (promise_content) => { // understand js wrapper for functions here
                        console.log(typeof(promise_content))
                        
                        // parse the returned content into corresponding upload-table fields, display the corresponding warning-flags (if exists) for each field
                        
                        // // -- check if content is a string or json object -- //
                        // if(typeof(promise_content) == String){
                        //     try{
                        //         let promise_content = JSON.stringify(promise_content).replace(/(?:\\[rn])+/g, '')
                                
                        //         promise_content = JSON.parse(promise_content)
                        //     } catch (error) {
                        //         console.log('content is not JSON parsable')
                        //     }
                        // }

                        if(typeof promise_content === "string"){
                            promise_content = JSON.parse(promise_content);
                        }
                        
                        parseExtractedData(promise_content)
                        renderExtractionDashboard(promise_content, responseTime)
                    }
                )
            }

        } catch(error) {
            console.log(error)
        }

    } catch(error) {
        console.log(error)
    }
}



/* =============================== Upload Table Even Handler <Start> ===============================*/

const lineItemsTableBody = document.getElementById('upload-table-line-items-table-body')

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