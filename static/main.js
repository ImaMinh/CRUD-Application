/* Main JS Script */


// handler for uploading form data
const uploadForm = document.querySelector("#invoice-result #myForm");

uploadForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    console.log("upload button working");

    const formData = new FormData(uploadForm);

    data = Object.fromEntries(formData);
    data = JSON.stringify(data);

    console.log("json data: ", data);

    fetch("http://127.0.0.1:8000/upload/json_form_data/", {
        method: 'POST', 
        // headers: {
        //     'Content-Type': 'application/json'
        // },
        body: data
    })
        .then((response) => response.json())
        .then((result) => { 
            console.log(result)
        })
        .catch(error => console.error(error));
})



// ######### Upload Image Handler #########
const uploadImage = document.querySelector("#input-form form");

uploadImage.addEventListener('submit', (event) => {
    event.preventDefault(); // preventing the page from refreshing
    
    const formData = new FormData(event.target)

    console.log("image form data: ", formData); 

    fetch("http://127.0.0.1:8000/upload/image", {
        method: 'POST',
        body: formData
    })
        .then((response) => response.json())
        .then((result) => {
            if(result.status == "success") { // result is the json object w/ return status and the data object
                console.log("successfully scanned")
                console.log("The result: ", result)
                renderInvoiceForm(result.data) // get the data from the return result
            }
        })
        .catch(error => console.error(error));
})

function renderInvoiceForm(data){  
    const myForm = document.querySelector("#invoice-result #myForm")

    for (const key in data) {
        if (key !== "line_items") {
            if(data[key].value != null){
                myForm[key].value = data[key].value;
            } else {
                myForm[key].value = "N/A";
            }
        }       
    }
}

// ###### Fetching and Displaying Invoices ######:
fetch(`http://127.0.0.1:8000/mongo_data/`, {
    method: 'GET',
    headers: {"Content-Type": "application/json"}
})
    .then(response => response.json())
    .then(res => {
        renderInvoiceList(res)
    })
    .catch(error => {console.log(error)})

function renderInvoiceList(data){
    invoice_lists = document.querySelector("#table-of-invoices")

    for(let invoice of data){

        const invoice_mongo_id = invoice._id

        console.log(invoice_mongo_id)

        const card = `
            <div class="invoice-card">
                <div class="card-data-field">
                    <h2>Invoice: ${invoice.invoice_number}</h2>    
                    <div class="card-invoice-content">
                        <p contenteditable="true"><strong>Invoice Number:</strong> <span data-field="invoice_number">${invoice.invoice_number}</span> </p>
                        <p contenteditable="true"><strong>Date:</strong> <span data-field="invoice_date">${invoice.invoice_date}</span> </p>

                        <p contenteditable="true"><strong>Vendor:</strong> <span data-field="vendor_name">${invoice.vendor_name}</span> </p>
                        <p contenteditable="true"><strong>Vendor Address:</strong> <span data-field="vendor_address">${invoice.vendor_address}</span> </p>

                        <p contenteditable="true"><strong>Bill To:</strong> <span data-field="bill_to_name">${invoice.bill_to_name}</span> </p>
                        <p contenteditable="true"><strong>Bill To Address:</strong> <span data-field="bill_to_address">${invoice.bill_to_address}</span> </p>

                        <p contenteditable="true"><strong>Subtotal:</strong> <span data-field="subtotal">${invoice.subtotal} </span></p>
                        <p contenteditable="true"><strong>Tax:</strong> <span data-field="tax">${invoice.tax}</span> </p>
                        <p contenteditable="true"><strong>Total:</strong> <span data-field="total">${invoice.total}</span> </p>

                        <p contenteditable="true"><strong>Currency:</strong> <span data-field="currency">${invoice.currency}</span> </p>
                        <p contenteditable="true"><strong>Payment Terms:</strong> <span data-field="payment_terms">${invoice.payment_terms}</span> </p>
                        <p contenteditable="true"><strong>Due Date:</strong> <span data-field="due_date">${invoice.due_date}</span> </p>
                    </div>
                </div>
                <div class="invoice-card-action">
                    <button data-id="${invoice_mongo_id.$oid}" type="update-content" class="update-btn" style="width: 30%; margin-bottom: .5rem;">Update</button>
                    <button data-id="${invoice_mongo_id.$oid}" type="delete-content" class="delete-btn" style="width: 30%">Delete</button>
                </div>
            </div>
        `

        invoice_lists.innerHTML += card;
    }
}

// ### Adding Functionality for Invoice Card Actions ###
invoice_list = document.querySelector("#table-of-invoices")

const updateButton = invoice_list.querySelector(".invoice-card .invoice-card-action .update-btn")
const deleteButton = invoice_list.querySelector(".invoice-card .invoice-card-action .delete-btn")
// why didn't querySelectorAll(":scope > .childClass work here? This created the 
// addEventListener issue")

// apply event listener for multiple sub-divs
invoice_list.addEventListener("click", function(event) {
    console.log(event.target.className)
    if(event.target.className == "update-btn"){
        // handler for update event
        
        // get the parent of the queried button 
        const invoice_div = (event.target).closest('.invoice-card')

        // get id of the invoice
        const invoice_id = (event.target).getAttribute('data-id')

        console.log("invoice-id = ", invoice_id)

        update_form_handler(invoice_div, invoice_id)
    } else if (event.target.className = "delete-btn"){
        // handler for delete event
    }
})

function update_form_handler(invoice_div, _id){
    // update JSON File and Update the Invoice 

    const mongo_id = _id
    
    json_file = extract_invoice_json(invoice_div, mongo_id)

    // console.log("type jsonfile: ", typeof json_file)

    fetch(`http://127.0.0.1:8000/update_data/${mongo_id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(json_file)
    })  
        .then(response => response.json())
        .then(result => {
            console.log(result)
        })
        .catch(e => console.log(e))
}

// helper function for update_form_handler to extract json content from HTML Card Div
function extract_invoice_json(invoice_div, _id){

    
    invoice_data_divs = invoice_div.querySelector(".card-data-field")
    
    data_divs = invoice_data_divs.querySelectorAll("[data-field]")

    // create a dictionary named fields that stores the pairs {dataset.field: element.innerHTML}
    fields = {}

    data_divs.forEach(element => {
        data_field = element.dataset.field
        fields[`${data_field}`] = element.innerHTML;
    })

    // console.log(fields)
    
    return {
        "_id": _id,
        "invoice_number": `${fields.invoice_number}` ?? "N/A",
        "invoice_date": `${fields.invoice_date}` ?? "N/A", 
        "vendor_name": `${fields.vendor_name}` ?? "N/A",
        "vendor_address": `${fields.vendor_address}` ?? "N/A",
        "bill_to_name": `${fields.bill_to_name}` ?? "N/A",
        "bill_to_address": `${fields.bill_to_address}` ?? "N/A",
        "currency": `${fields.currency}` ?? "N/A",
        "subtotal": `${fields.subtotal}` ?? "N/A",
        "tax": `${fields.tax}` ?? "N/A", 
        "total": `${fields.total}` ?? "N/A",
        "payment_terms": `${fields.payment_terms}` ?? "N/A",
        "due_date": `${fields.due_date}` ?? "N/A"
    };
}
