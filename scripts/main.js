import DataGrid from './DataGrid.js'
import ToTop from '../vendors/rui/rui-to-top-btn.min.js'

(() => {
    window.DataGrids = {}
    // ToTop()

    const custDataReadUrl = '../sales/php/customer_read.php'
    
    fetch(custDataReadUrl)
    .then(response => response.json())
    .then(
        /**
         * @param {Object} customer
         * @param {Object[]} customer.rows
         * @param {Number} customer.numRows
         */
        customer => {
            window.DataGrids.Customers = new DataGrid({
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
                dataReadUrl: custDataReadUrl,
                dataCreateUrl: '../sales/php/customer_create.php',
                dataDeleteUrl: '../sales/php/customer_delete.php'
            })
        }
    )
    .catch(e => console.error(e))
})()