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
            const columns = {
                Title: {
                    formElement: {
                        name: 'select',
                        options: ['Dr.', 'Miss', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Rev.']
                    }
                },
                'First Name': {
                    formElement: {
                        name: 'input',
                        type: 'text',
                        pattern: '([A-Z]{1}[a-z]{1,}|[A-Z]{1}[a-z]{1,}-[A-Z]{1}[a-z]{1,})'
                    }
                },
                'Last Name': {
                    formElement: {
                        name: 'input',
                        type: 'text',
                        pattern: '([A-Z]{1}[a-z]{1,}|[A-Z]{1}[a-z]{1,}-[A-Z]{1}[a-z]{1,})'
                    }
                },
                Email: {
                    formElement: {
                        name: 'input',
                        type: 'text',
                        pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
                    }
                },
                Parish: {
                    formElement: {
                        name: 'select',
                        options: [
                            'Christ Church', 'St. Andrew', 'St. George', 'St. James', 'St. John',
                            'St. Joseph', 'St. Lucy', 'St. Michael', 'St. Peter', 'St. Philip',
                            'St. Thomas'
                        ]
                    }
                },
                Address: {
                    formElement: {
                        name: 'textarea'
                    }
                },
                'Home Number': {
                    formElement: {
                        name: 'input',
                        type: 'text',
                        pattern: '([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}'
                    }
                },
                'Cell Number': {
                    formElement: {
                        name: 'input',
                        type: 'text',
                        pattern: '([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}'
                    }
                },
                'Other Numbers': {
                    formElement: {
                        multiple: true,
                        name: 'input',
                        type: 'text',
                        pattern: '([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}'
                    }
                }
            }
            const checkboxId = 'customers'
            const data = {
                columns,
                rows: customer.rows,
                numRows: customer.numRows,
                checkboxId,
                phpPath: custPhpPath
            }
            window.DataGrids.Customers = new DataGrid('customers', data)
        }
    )
    .catch(e => console.error(e))
})()