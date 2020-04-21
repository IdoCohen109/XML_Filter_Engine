// CONFIGURATIONS
const FLOW_NAME = 'QDF/SSPEC'
const HEADERS_BY_PRODUCT = {
    "CML82": ["QDF/SSPEC", "Functional Core", "FUNCTIONAL EXECUTION UNIT QTY", "Speed", "Max Turbo Frequency Rate", "Cache"],
    "CML42": ["QDF/SSPEC", "COMMENTS - PRE-PROD", "CPU TYPE", "Cache", "CPU Slot/Socket Type"],
}

const $inputFile = document.getElementById('inputPath')
const $parseAndRenderButton = document.getElementById('inputPathValue')
const $productTypeSelector = document.getElementById('product_type')

//DOM elements
let $table = document.getElementById("BinMatrixTable");
let $tableHeader = document.getElementById("table-headers");
let $tableBody = document.getElementById("table-body");

// Process
init()

function init() {
    renderHeadersSelector()
    //Event listener to get the input path in url variable 
    $parseAndRenderButton.addEventListener("click", function () {
        getFileData($inputFile, dataTXT => {
            if (dataTXT) {
                const parsed = parseData(convertToXML(dataTXT))
                const filterBy = $productTypeSelector.value
                renderHeader(parsed, filterBy)
                renderBody(parsed, filterBy)
            }
        })
    })

    function convertToXML(txt) {
        const xmlParser = new DOMParser()
        return xmlParser.parseFromString(txt, 'application/xml');
    }
}

function getFileData($fileInput, cb) {
    const file = $fileInput.files[0] || null

    if (!file) return null

    const reader = new FileReader()
    reader.onload = function (data) {
        cb(data.target.result)
    }
    reader.readAsText(file)

}

//create the selection for the filter with the filterSets from "HEADERS BY PRODUCT"
function renderHeadersSelector() {
    $productTypeSelector.options.add(new Option("select Product", "select Product"))
    for (const productName in HEADERS_BY_PRODUCT) {
        console.log(productName)
        $productTypeSelector.options.add(new Option(productName, productName))
    }
}

//data is equal to xml data base from file
function parseData(data) {
    const flows = data.getElementsByTagName("Flow");
    const parsed = {
        headers: new Set(),
        data: {}
    }

    for (let flow of flows) {
        const attributes = flow.getElementsByTagName('Attribute')

        let currentFlowName = ''
        const currentFlow = {}

        //*******************code explanation:*******************
        //attrName = name of attribute
        //attrValue = attribute value
        //**************************************
        for (let attribute of attributes) {
            const attrName = attribute.attributes.name.nodeValue
            const attrValue = attribute.textContent
            if (attrName === FLOW_NAME) currentFlowName = attrValue
            currentFlow[attrName] = attrValue

            //*******************code explanation:*******************
            //add into parsed object's headers property the attributes names
            //current flow now will had the QDF name
            //**************************************
            parsed.headers.add(attrName)
        }
        parsed.data[currentFlowName] = currentFlow
    }
    return parsed
}

// #################   UPDATES By Ido #########################
// 13.3.20 updated by Ido
// this function get the pared data, filter and flow
// i print here the headers according to filter set definition
//
//open - need to fill the table with the values of the headers according to flow (each row is new flow)
//open - need to create this function with event Listner of select
function renderHeader(DBData, filterName) {

    filter = HEADERS_BY_PRODUCT[filterName]
    $tableHeader = "";
    for (let Attribute of filter) {
        for (let DBAttribute of DBData.headers) {
            if (DBAttribute === Attribute) {
                $tableHeader += `<th>${DBAttribute}</th>`;
            }
        }
    }
    document.getElementById("table-headers").innerHTML = $tableHeader;
}

//renders and fills the table with data according to relevant headers - in this way i'm keeping the table filtered by headers
function renderBody(DBData, filterName) {

    filter = HEADERS_BY_PRODUCT[filterName]
    console.log("DBData in render body: HEADERS_BY_PRODUCT[filterName]", DBData.data)
    $tableBody = "";

    for (let DBAttribute in DBData.data) {
        $tableBody += '<tr>'
        for (let header of filter) {
            $tableBody += `<td>${DBData.data[DBAttribute][header]}</td>`
        }
        $tableBody += '</tr>'
    }
    document.getElementById("table-body").innerHTML = $tableBody;
}