import DataGrid from './DataGrid.js'
import ToTop from '../vendors/rui/rui-to-top-btn.min.js'

(() => {
    window.DataGrids = {}
    // ToTop()

    const custRetrieveDataUrl = '../sales/php/getcustomers.php'
    
    fetch(custRetrieveDataUrl)
    .then(response => response.json())
    .then(
        /**
         * @param {Object} customer
         * @param {Object[]} customer.rows
         * @param {Number} customer.numRows
         */
        customer => {
            const data = {
                columns: {
                    'Customer ID': 'cId',
                    Title: 'title',
                    'First Name': 'fname',
                    'Last Name': 'lname',
                    Email: 'email',
                    Parish: 'parish',
                    Address: 'address',
                    'Home Number': 'homeNo',
                    'Cell Number': 'cellNo',
                    'Other Numbers': 'otherNos'
                },
                rows: customer.rows,
                numRows: customer.numRows,
                retrieveDataUrl: custRetrieveDataUrl,
                insertDataUrl: '../sales/php/insertcustomer.php'
            }
            window.DataGrids.Customers = new DataGrid('customers', data)
        }
    )
    .catch(e => console.error(e))
})()