/* Main JS Script */


// handler for uploading form data
const uploadForm = document.querySelector("#invoice-result #myForm");

if(uploadForm == null){
    console.log("upload form null");
} else {
    console.log("uploadForm found")
}

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



// handler for uploading image
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
fetch("http://127.0.0.1:8000/mongo_data/", {
    method: 'GET',
    headers: {"Content-Type": "application/json"}
})
    .then(response => response.json())
    .then(res => {
        renderInvoiceTable(res)
    })
    .catch(error => {console.log(error)})

function renderInvoiceTable(data){
    invoiceTableContent = document.querySelector("#invoice-data-table #invoice-data")

    console.log(invoiceTableContent == null)

    console.log(data)
    
    for(let invoice of data){
        console.log(invoice)
        row = `
            <tr style="border: 1px solid black;">
                <td>${invoice.invoice_number}</td>
                <td>${invoice.invoice_date}</td>
                <td>${invoice.vendor_name}</td>
                <td>${invoice.vendor_address}</td>
                <td>${invoice.bill_to_name}</td>
                <td>${invoice.bill_to_address}</td>
                <td>${invoice.currency}</td>
                <td>${invoice.subtotal}</td>
                <td>${invoice.tax}</td>
                <td>${invoice.total}</td>
                <td>${invoice.payment_terms}</td>
                <td>${invoice.due_date}</td>
            </tr>
        `
        invoiceTableContent.innerHTML += row;
    }
}
