import DataGrid from './DataGrid.js'
import ToTop from '../vendors/rui/rui-to-top-btn.min.js'

(() => {
    window.DataGrids = {}
    // ToTop()

    const custRetrieveDataUrl = '../sales/php/customer_get.php'
    
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
                table: {
                    name: 'Customers',
                    dbName: 'customers'
                },
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
                insertDataUrl: '../sales/php/customer_insert.php'
            }
            window.DataGrids.Customers = new DataGrid(data)
        }
    )
    .catch(e => console.error(e))
})()