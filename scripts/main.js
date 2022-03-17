import DataGrid from './DataGrid.js'
import ToTop from '../vendors/rui/rui-to-top-btn.min.js'

(() => {
    window.DataGrids = {}
    // ToTop()

    const crudCustomerUrl = '../sales/php/crud_customer.php'
    
    fetch(crudCustomerUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'READ_ALL' })
    })
    .then(response => response.json())
    .then(
        /**
         * @param {Object} customer
         * @param {Object[]} customer.rows
         * @param {Object[]} customer.rowIds
         * @param {Number} customer.numRows
         */
        customer => {
            window.DataGrids.Customers = new DataGrid({
                table: {
                    name: 'Customers',
                    dbName: 'customers'
                },
                columns: {
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
                rowIds: customer.rowIds,
                crudUrl: crudCustomerUrl
            })
        }
    )
    .catch(e => console.error(e))
})()