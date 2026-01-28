// -- miscalleneous variables --- // 

const ports = {
    'debug_port': 4000,
    'main_port': 8000
}
const isDebug = false

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


/* ============== Handler For Rendering Extraction Dashboard ============== */
function renderExtractionDashboard(extractionData, responseTime){
    
    // --- get the dashboard body container ---
    const dashboardBody = document.getElementById('dashboard-table-body')
    
    // --- clear existing content ---
    dashboardBody.innerHTML = ''
    
    // --- define the fields to display (in order) ---
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
    
    // --- loop through each field and create the row ---
    fields.forEach(fieldName => {
        if (extractionData.hasOwnProperty(fieldName)) {
            
            const fieldData = extractionData[fieldName]
            let confidence = fieldData.confidence || 0
            let confidencePercent = Math.round(confidence * 100)

            if(confidencePercent == 0){
                confidencePercent = 10
            }
            
            // --- 1. create the row element --- //
            const rowDiv = document.createElement('div')
            rowDiv.className = 'row align-items-center mb-1'
            
            // --- a. create new field column --- //
            const keyDiv = document.createElement('div')
            keyDiv.className = 'extraction-field-key col-3 p-0 ps-4'
            keyDiv.style.fontSize = '13px'
            keyDiv.innerHTML = `<span class="fw-bold">${fieldName}</span>`
            
            // --- b. create the confidence column --- //
            const confidenceDiv = document.createElement('div')
            confidenceDiv.className = 'extraction-field-confidence col-9 p-0'
            
            // --- c. add progress bar to confidence-column based on confidence --- //
            let progressBarClass = 'progress-bar'
            if (confidencePercent >= 90) {
                progressBarClass += ' bg-success'
            } else if (confidencePercent >= 70) {
                progressBarClass += ' bg-info'
            } else if (confidencePercent >= 50) {
                progressBarClass += ' bg-warning'
            } else {
                progressBarClass += ' bg-danger text-dark'
            }
            
            confidenceDiv.innerHTML = `
                <div class="progress">
                    <div class="${progressBarClass}" style="width: ${confidencePercent}%"> ${confidencePercent}%</div>
                </div>
            `
            
            // --- append to row --- //
            rowDiv.appendChild(keyDiv)
            rowDiv.appendChild(confidenceDiv)
            
            // --- append row to dashboard body --- //
            dashboardBody.appendChild(rowDiv)
        }
    });

    // --- handle line_items separately - render each item as its own row ---
    if (extractionData.hasOwnProperty('line_items') && Array.isArray(extractionData.line_items)) {
        extractionData.line_items.forEach((lineItem, index) => {
            const itemNumber = index + 1
            const fields = ['description', 'quantity', 'unit_price', 'amount']
            
            fields.forEach((field, idx) => {
                if (lineItem[field]) {
                    let confidence = lineItem[field].confidence || 0
                    let confidencePercent = Math.round(confidence * 100)

                    if(confidencePercent == 0){
                        confidencePercent = 10
                    }
                    
                    // --- create the row element --- 
                    const rowDiv = document.createElement('div')
                    rowDiv.className = 'row align-items-center mb-1'
                    
                    // --- create the field key column ---
                    const keyDiv = document.createElement('div')
                    keyDiv.className = 'extraction-field-key col-3 p-0 ps-4'
                    keyDiv.style.fontSize = '14px';
                    keyDiv.innerHTML = `<span class="fw-bold">${field}_${itemNumber}</span>`
                    
                    // --- create the confidence column ---
                    const confidenceDiv = document.createElement('div')
                    confidenceDiv.className = 'extraction-field-confidence col-9 p-0'
                    
                    // --- determine progress bar color based on confidence --- 
                    let progressBarClass = 'progress-bar'
                    if (confidencePercent >= 90) {
                        progressBarClass += ' bg-success'
                    } else if (confidencePercent >= 70) {
                        progressBarClass += ' bg-info';
                    } else if (confidencePercent >= 50) {
                        progressBarClass += ' bg-warning'
                    } else {
                        progressBarClass += ' bg-danger text-dark'
                    }
                    
                    confidenceDiv.innerHTML = `
                        <div class="progress">
                            <div class="${progressBarClass}" style="width: ${confidencePercent}%"> ${confidencePercent}%</div>
                        </div>
                    `
                    
                    // -- append to row element -- //
                    rowDiv.appendChild(keyDiv);
                    rowDiv.appendChild(confidenceDiv)
                    
                    // --- append row to dashboard body --- //
                    dashboardBody.appendChild(rowDiv)
                }
            });
        });
    }
    
    // Update response time in footer
    const responseTimeElement = document.getElementById('dashboard-response-time-label')
    if (responseTimeElement) {
        responseTimeElement.textContent = `${responseTime / 1000}s`
    }
}




/* ============== Handler For Upload Invoice Form ============== */

/* ==== functionality for extraction model list ==== */
const extraction_model_menu_options = document.getElementById('extraction-model-dropdown-menu').querySelectorAll('.dropdown-item')

extraction_model_menu_options.forEach( (item) => {
    item.addEventListener('click', function(event) {
        console.log(this)
        
        event.preventDefault()

        // accessing the value of the selected item from the menu
        const selectedValue = this.getAttribute('data-value')
        const selectedText = this.textContent

        // query the button and the hidden input field
        const menuButton = document.getElementById('extraction-model-dropdown-button')
        const modelInput = document.getElementById('extraction-model-input')

        // fill in the values
        menuButton.textContent = selectedText
        modelInput.value = selectedValue
    })
})

/* ==== upload invoice image handler ==== */
async function formUploadImageHandler(event){ /* call-back func, understand how to do async await later */
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

        const Invoice_Form_Input = Invoice_Form.elements.image_file // the file field is taken from the name field of the input

        const fileList = Invoice_Form_Input.files

        const image_file = fileList[0]

        const model_type = Invoice_Form.elements.extraction_model.value

        if(!model_type){
            const modelButton = document.getElementById('extraction-model-dropdown-button')

            modelButton.classList.add('border-danger')

            const modelInput = document.getElementById('extraction-model-input')

            alert('Please select an extraction model')

            return
        }

        /* 2. Validate the File Type */
        file_type_is_valid = fileTypeValidation(image_file.type)

        // -- if file type is invalid, set a validity report and return to the browser -- //
        if(!file_type_is_valid){
            // set custom validity here  
            validity_msg = 'Invalid file type! Please upload an image or pdf'

            Invoice_Form_Input.setCustomValidity(validity_msg)
            Invoice_Form_Input.reportValidity()

            return
        }

        // -- if file type is valid, continue the process -- //

        /* 4. Make a fetch request to upload the image to the backend server */
        
        // a. create a form-data object (simplifies logic for later processes)
        const formData = new FormData()

        
        formData.append('file', image_file)

        console.log(model_type)

        // b. append the model type
        formData.append('extraction_model', model_type)

        const initObject = {
            method: 'POST',
            body: formData
        }

        // -- set running port: for debug_port: 4000, for main_port: 8000 --
        const port = ports['main_port']
        const url = `http://127.0.0.1:${port}/invoices/scanner`

        try{
            const startTime = Date.now()

            const response = await fetch(url, initObject) // -- await unwraps the promise like .then(), returns the response.body(...) which is a promise

            if(response.ok){
                let content = await response.json() // -- uses response.json(), an async function, and uses await to unwrap the json content of the promise the json() method returns

                // -- make sure the content is a JSON obj so the program doesn't break
                if(typeof(content) == 'string'){
                    content = JSON.parse(content)
                }

                const endTime = Date.now()
                const responseTime = endTime - startTime

                console.log(responseTime)

                parseExtractedData(content)
                renderExtractionDashboard(content, responseTime) /* TODO: calculate the response time here */
            }

        } catch(error) {
            console.error("Upload failed:", error)
        }

    } catch(error) {
        console.error("Upload failed:", error)
    }
}




/* =============================== Upload Form and DashBoard Even Handler <End> ===============================  */













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

uploadTableForm.addEventListener('submit', async function(event) {
    event.preventDefault()

    const formData = new FormData(uploadTableForm)

    const uploadData = serializeFormData(formData)

    // reloadAfterSubmitHandler()
    
    if(confirm('you sure you want to submit')){ 
        
        // -- set running port: for debug_port: 4000, for main_port: 8000 --
        const port = ports['main_port']
        const url = `http://127.0.0.1:${port}/uploaded/invoices`

        const initObject = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: uploadData
        }

        try {
            const response = await fetch(url, initObject)
            
            if(response.ok){
                console.log('Upload data successful')
            } else {
                const errorData = await response.json()
                console.error('Server Validation Error:', errorData)
                alert(`Upload Failed: ${JSON.stringify(errorData)}`)
            }

        } catch (error){
            console.log("Upload data failed: ", error)
        }
       
    } else {
        // discard invoice and reload the page
    }
})

// --- 2. format the form-data data into required format  --- //
function serializeFormData(formData){

    // --- a. create the base data structure --- //
    let invoice_structure = {
        'invoice_number': formData.get('invoice_number'),
        'invoice_date': formData.get('invoice_date'),
        'vendor_name': formData.get('vendor_name'),
        'vendor_address': formData.get('vendor_address'),
        'bill_to_name': formData.get('bill_to_name'),
        'bill_to_address': formData.get('bill_to_address'),
        'currency': formData.get('currency'),
        'subtotal': Number(formData.get('subtotal')) || 0,
        'tax': Number(formData.get('tax')) || 0,
        'total': Number(formData.get('total')) || 0,
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
                'quantity': Number(quantity) || 0,
                'unit_price': Number(unit_price) || 0,
                'amount': Number(amount) || 0
            }

            
            // --- before appending to the list of items, check if the item is empty (all data fields are null) or not --- //
            if(filterLineItem(item) == true){
                items.push(item)
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

    try{
        // convert the structure into a valid JSON schema
        invoice_structure = JSON.stringify(invoice_structure, replaceEmptyStringsWithNull)
        return invoice_structure

    } catch(error){
        console.log('serializeFormData, cannot parse invoice as JSON: ', error)
    }
    
}


/* =============================== Upload Table Even Handler <END> =============================== */















/* =============================== Display Data Cards <START> =============================== */


/* ================= get upload data and render uploaded invoices ================= */

function renderDataCardsLineItems(invoice, cardClone){
    line_items = invoice.line_items

    const tbody = cardClone.querySelector("#card-body-invoice-line-items-table-body")

    if(!line_items || line_items.length == 0){
        return
    }

    tbody.innerHTML = ``

    line_items.forEach((item) => {
        const data_card_line_item_template = document.getElementById('uploaded-invoice-display-card-inline-item-template')
    
        const itemClone = document.importNode(data_card_line_item_template, true).content

        const line_item_description = itemClone.querySelector('#data-cards-line-item-description');
        const line_item_quantity = itemClone.querySelector('#data-cards-line-item-quantity');
        const line_item_unit_price = itemClone.querySelector('#data-cards-line-item-unit-price');
        const line_item_amount = itemClone.querySelector('#data-cards-line-item-amount');
        
        if(line_item_description) line_item_description.textContent = item.description || 'empty';
        if(line_item_quantity) line_item_quantity.textContent = item.quantity || '0';
        if(line_item_unit_price) line_item_unit_price.textContent = item.unit_price ? `${item.unit_price}` : '0.00';
        if(line_item_amount) line_item_amount.textContent = item.amount ? `${item.amount}` : '0.00';
        

        tbody.appendChild(itemClone);
    })
}
    
function renderUploadedDataCards(invoices){
    const CardsContainer = document.getElementById('data-cards-container')

    if(invoices == null || invoices.length == 0){
        return
    }

    // == start of for loop ==
    invoices.forEach((invoice, idx) => {
        // console.log("invoice: ", invoice)

        // -- 1. get the template content -- //
        let invoice_card_template = document.getElementById('uploaded-invoice-display-card-template').content


        // -- 2. create the clone -- //
        const clone = document.importNode(invoice_card_template, true)

        // -- 3. modify the clone -- //
        if(clone != null){
            
            // ---- card header display section ---- //
            const card_header = clone.querySelector('#invoice-card-header')
            
            const card_header_number = card_header.querySelector('#invoice-card-header-number')
            const card_header_date = card_header.querySelector('#invoice-card-header-date')

            if(card_header_number){
                card_header_number.textContent = invoice.invoice_number ? `#${invoice.invoice_number}` : 'null'
            }

            if(card_header_date){
                card_header_date.textContent = invoice.invoice_date ? `${invoice.invoice_date}` : 'null'
            }   


            // --- card body display section --- //
            
            // --- vendor info ---
            const vendor_name = clone.querySelector('#card-body-header-information-vendor-name')
            const vendor_address = clone.querySelector('#card-body-header-information-vendor-address')
            
            if(vendor_name){
                vendor_name.textContent = invoice.vendor_name || 'empty'
            } 
            if(vendor_address){
                vendor_address.textContent = invoice.vendor_address || 'empty'
            } 

            // --- bill to info --- //
            const bill_to_name = clone.querySelector('#card-body-header-information-bill-to-name')
            const bill_to_address = clone.querySelector('#card-body-header-information-bill-to-address')

            if(bill_to_name){
                bill_to_name.textContent = invoice.bill_to_name || 'empty'
            }

            if(bill_to_address){
                bill_to_address.textContent = invoice.bill_to_address || 'empty'
            }

            // --- invoice details info --- //
            const invoice_number = clone.querySelector('#card-body-invoice-details-invoice-number')
            const invoice_date = clone.querySelector('#card-body-invoice-details-invoice-date')
            const invoice_due_date = clone.querySelector('#card-body-invoice-datails-due-date')
            const invoice_payment_terms = clone.querySelector('#card-body-invoice-details-invoice-payment-terms')
            
            if(invoice_number){
                invoice_number.textContent = invoice.invoice_number || 'empty'
            }

            if(invoice_date){
                invoice_date.textContent = invoice.invoice_date || 'empty'
            }

            if(invoice_due_date){
                invoice_due_date.textContent = invoice.due_date || 'empty'
            }

            
            if(invoice_payment_terms){
                invoice_payment_terms.textContent = invoice.payment_terms || 'empty'
            }

            // --- line items --- //
            renderDataCardsLineItems(invoice, clone)

            // --- totals --- //
            const currency = clone.querySelector('#card-body-totals-currency')
            const subtotal = clone.querySelector('#card-body-totals-subtotal');
            const tax = clone.querySelector('#card-body-totals-tax');
            const total = clone.querySelector('#card-body-totals-total');

            if(currency) currency.textContent = invoice.currency ? `${invoice.currency}` : 'N/A'
            if(subtotal) subtotal.textContent = invoice.subtotal ? `${invoice.subtotal}` : '0.00';
            if(tax) tax.textContent = invoice.tax ? `${invoice.tax}` : '0.00';
            if(total) total.textContent = invoice.total ? `${invoice.total}` : '0.00';

           
            /* --- add the edit handler to card edit buttons */
            const editButton = clone.querySelector('#uploaded-invoice-display-card-edit-button')
            const cardElement = clone.querySelector('.card')    

            if(editButton){
                editButton.removeAttribute('onclick')

                let invoiceIDString
                if(invoice._id && invoice._id.$oid) {
                    invoiceIDString = invoice._id.$oid
                } else {
                    invoiceIDString = invoice._id
                }

                editButton.addEventListener('click', function() {
                    toggleEditMode(cardElement, invoiceIDString)
                })
            }
            
        }

        // == end of for loop == //

        // -- 4. append the modified clone -- // 
        CardsContainer.appendChild(clone)
    })
}

async function getUploadedInvoices(){
    try {
        
        const initObject = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }

        const port = ports['main_port']
        const url = `http://127.0.0.1:${port}/uploaded/invoices`

        let response = await fetch(url, initObject)

        if(response.ok){
            response = await response.json()

            // console.log(response)

            // render the data cards
            renderUploadedDataCards(response)
        } else {
            alert('Unable to get uploaded data from server!')
        }

    } catch(error){
        console.log(error)
    }
}

getUploadedInvoices()


/* ================= edit mode handler ================= */

function toggleEditMode(card, invoiceID){
    const editButton = card.querySelector('#uploaded-invoice-display-card-edit-button')
    
    const isEditing = editButton.classList.contains('btn-edit-active')

    // -- toggle edit mode here (if button is clicked but isEditing != true --> toggle) --
    if(!isEditing) {
        if(confirm('Edit this invoice?')){
            editButton.innerHTML = `<i class="bi bi-check-lg"></i> Save`
            editButton.classList.add('btn-edit-active', 'bg-success')
            enterEditMode(card, invoiceID)
        } else {
            return
        }
    } else {
        editButton.innerHTML = `<i class="bi bi-pencil"></i> Edit`
        editButton.classList.remove('btn-edit-active', 'bg-success')
        saveChanges(card, invoiceID)
        exitEditMode(card, invoiceID)
    }

}

async function uploadUpdatedData(updatedData, invoiceID){
    try{
        
        // --- convert data to json string before sending ---
        updatedData = JSON.stringify(updatedData)

        // --- ensure invoiceID is a a string 
        let idString
        if(typeof(invoiceID) == 'object' && invoiceID.$oid) {
            idString = invoiceID.$oid
        } else {
            idString = String(invoiceID)
        }

        const initObject = {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: updatedData
        }

        const port = ports['main_port']
        const url = `http://127.0.0.1:${port}/uploaded/invoices/${idString}`

        const upload_response = await fetch(url, initObject)

        if(upload_response.ok){
            const result = await upload_response.json()
            console.log('Update successful:', result)
            alert('Invoice updated successfully!')
        } else {
            const error = await response.json()
            console.error('Update failed:', error)
            alert('Failed to update invoice: ' + error.message)
        }

    } catch(error) {
        console.error('Error updating invoice:', error)
        alert('Error updating invoice!')
    }
}

function saveChanges(cardElement, invoiceID) {
    const inputs = cardElement.querySelectorAll('.field-edit');
    let updatedData = {}
    let lineItemField = []

    // --- base data structure --- //
    let base_invoice_structure = {
        // '_id': invoiceID,
        'invoice_number': null,
        'invoice_date': null,
        'vendor_name': null,
        'vendor_address': null,
        'bill_to_name': null,
        'bill_to_address': null,
        'currency': null,
        'subtotal': null,
        'tax': null,
        'total': null,
        'payment_terms': null,
        'due_date': null,
        'line_items': []
    }
    
    
    inputs.forEach((input, index) => {
        const fieldName = (input.dataset.field) || null
        const type = input.dataset.type

        if(type != null || type == 'line-item' || fieldName == null){
            // push each input element with field-name and row container, row container value will be used to group all fields (qty, amount, etc.) within that field //
            lineItemField.push( 
                {
                    field: fieldName,
                    value: input.value || null,
                    row: input.closest('tr')
                }
            )
        } else {
            // -- get the new value -- //
            let newValue = input.value
            
            // -- assign it to new data obj -- //
            base_invoice_structure[fieldName] = newValue
        }
    })

    // --- group the line items --- //


    let lineItemsByRow = {} // temporary dictionary for grouping

    lineItemField.forEach( ({field, value, row}) => {
    
        // get the index of the row containing the current field in the field list //
        const rowIndex = Array.from(row.parentElement.children).indexOf(row) 

        if(!lineItemsByRow[rowIndex]){
            lineItemsByRow[rowIndex] = {}
        }

        lineItemsByRow[rowIndex][field] = value
    })

    // !! code below uses help of Co-Pilot !!
    let item_list = Object.keys(lineItemsByRow).sort((a, b) => a - b).map(rowIndex => lineItemsByRow[rowIndex])

    base_invoice_structure.line_items = item_list

    updatedData = base_invoice_structure

    // --- upload the data --- //
    uploadUpdatedData(updatedData, invoiceID)
}

function enterEditMode(card, invoiceID){
    const displays = card.querySelectorAll('.field-display')
    const inputs = card.querySelectorAll('.field-edit')

    displays.forEach((display, index) => {
        const input = inputs[index];
        if (input) {
            
            input.value = display.textContent || 'null';
            
            display.classList.add('d-none');
            input.classList.remove('d-none');
        }
    })
}

function exitEditMode(card, invoiceID){
    const displays = card.querySelectorAll('.field-display')
    const inputs = card.querySelectorAll('.field-edit')
    
    displays.forEach((display) => {
        display.classList.remove('d-none')
    });
    
    inputs.forEach((input) => {
        input.classList.add('d-none')
    });
}




