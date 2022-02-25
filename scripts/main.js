import DataGrid from './DataGrid.js'
import ToTop from '../vendors/rui/rui-to-top-btn.min.js'

(() => {
    window.DataGrids = {}
    // ToTop()

    const custPhpPath = '../sales/php/getcustomers.php'
    
    fetch(custPhpPath)
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
                phpPath: custPhpPath
            }
            window.DataGrids.Customers = new DataGrid('customers', 'customers', data)
        }
    )
    .catch(e => console.error(e))
})()

// const columns = {
//     Title: {
//         dbName: 'title',
//         formElement: {
//             name: 'select',
//             options: ['Dr.', 'Miss', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Rev.']
//         }
//     },
//     'First Name': {
//         dbName: 'fname',
//         formElement: {
//             name: 'input',
//             type: 'text',
//             pattern: '([A-Z]{1}[a-z]{1,}|[A-Z]{1}[a-z]{1,}-[A-Z]{1}[a-z]{1,})'
//         }
//     },
//     'Last Name': {
//         dbName: 'lname',
//         formElement: {
//             name: 'input',
//             type: 'text',
//             pattern: '([A-Z]{1}[a-z]{1,}|[A-Z]{1}[a-z]{1,}-[A-Z]{1}[a-z]{1,})'
//         }
//     },
//     Email: {
//         dbName: 'email',
//         formElement: {
//             name: 'input',
//             type: 'email',
//             pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
//         }
//     },
//     Parish: {
//         dbName: 'parish',
//         formElement: {
//             name: 'select',
//             options: [
//                 'Christ Church', 'St. Andrew', 'St. George', 'St. James', 'St. John',
//                 'St. Joseph', 'St. Lucy', 'St. Michael', 'St. Peter', 'St. Philip',
//                 'St. Thomas'
//             ]
//         }
//     },
//     Address: {
//         dbName: 'address',
//         formElement: {
//             name: 'textarea'
//         }
//     },
//     'Home Number': {
//         dbName: 'homeNo',
//         formElement: {
//             name: 'input',
//             type: 'text',
//             pattern: '([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}'
//         }
//     },
//     'Cell Number': {
//         dbName: 'cellNo',
//         formElement: {
//             name: 'input',
//             type: 'text',
//             pattern: '([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}'
//         }
//     },
//     'Other Numbers': {
//         dbName: 'otherNos',
//         formElement: {
//             name: 'textarea',
//             pattern: '([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}'
//         }
//     }
// }