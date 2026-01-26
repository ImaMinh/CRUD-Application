ports = {
    'test_port': 8000
}



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

        // == end of for loop ==

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

        const port = ports['test_port']
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

        const port = ports['test_port']
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
