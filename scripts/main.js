import DataGrid from './DataGrid.js'

(() => {
    window.DataGrids = {} 

    const crudCustomerUrl = '../sales/php/crud_customer.php'
    const crudProductUrl = '../sales/php/crud_product.php'

    const REQUEST_ACTION = new FormData()
    REQUEST_ACTION.append('REQUEST_ACTION', 'READ_ALL')
    
    // Customers
    fetch(crudCustomerUrl, {
        method: 'POST',
        body: REQUEST_ACTION
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
                    name: 'Customer',
                    dbName: 'customers'
                },
                columns: {
                    Title: {
                        dbName: 'title',
                        tagName: 'select',
                        tag: {
                            labelText: 'Titles',
                            attrs: { name: 'title' },
                            options: [
                                { value: '', textContent: 'Select a title...' },
                                { value: 'Dr.', textContent: 'Dr.' },
                                { value: 'Miss', textContent: 'Miss' },
                                { value: 'Mr.', textContent: 'Mr.' },
                                { value: 'Mrs.', textContent: 'Mrs.' },
                                { value: 'Ms.', textContent: 'Ms.' },
                                { value: 'Prof.', textContent: 'Prof.' },
                                { value: 'Rev.', textContent: 'Rev.' }
                            ]
                        }
                    },
                    'First Name': {
                        dbName: 'fname',
                        tagName: 'input',
                        tag: {
                            attrs: {
                                type: 'text', name: 'fname', pattern: '[A-Za-z\\-\\s]{1,}',
                                title: 'Only letters, hyphens and spaces allowed',
                                placeholder: 'First Name', required: ''
                            }
                        }
                    },
                    'Last Name': {
                        dbName: 'lname',
                        tagName: 'input',
                        tag: {
                            attrs: {
                                type: 'text', name: 'lname', pattern: '[A-Za-z\\-\\s]{1,}',
                                title: 'Only letters, hyphens and spaces allowed',
                                placeholder: 'Last Name'
                            }
                        }
                    },
                    Email: {
                        dbName: 'email',
                        tagName: 'input',
                        tag: {
                            attrs: {
                                type: 'email', name: 'email',
                                pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                                title: 'Must be in the form: example@example.ex',
                                placeholder: 'Email'
                            }
                        }
                    },
                    Parish: {
                        dbName: 'parish',
                        tagName: 'select',
                        tag: {
                            labelText: 'Parishes',
                            attrs: { name: 'parish' },
                            options: [
                                { value: '', textContent: 'Select a parish...' },
                                { value: 'Christ Church', textContent: 'Christ Church' },
                                { value: 'St. Andrew', textContent: 'St. Andrew' },
                                { value: 'St. George', textContent: 'St. George' },
                                { value: 'St. James', textContent: 'St. James' },
                                { value: 'St. John', textContent: 'St. John' },
                                { value: 'St. Joseph', textContent: 'St. Joseph' },
                                { value: 'St. Lucy', textContent: 'St. Lucy' },
                                { value: 'St. Michael', textContent: 'St. Michael' },
                                { value: 'St. Peter', textContent: 'St. Peter' },
                                { value: 'St. Philip', textContent: 'St. Philip' },
                                { value: 'St. Thomas', textContent: 'St. Thomas' }
                            ]
                        }
                    },
                    Address: {
                        dbName: 'address',
                        tagName: 'textarea',
                        tag: {
                            attrs: {
                                name: 'address', rows: '4', placeholder: 'Address...'
                            }
                        }
                    },
                    'Home Number': {
                        dbName: 'homeNo',
                        tagName: 'input',
                        tag: {
                            attrs: {
                                type: 'tel', name: 'homeNo', pattern: '([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}',
                                title: 'Must be 10 or more numbers/hyphens long',
                                placeholder: 'Home Number'
                            }
                        }
                    },
                    'Cell Number': {
                        dbName: 'cellNo',
                        tagName: 'input',
                        tag: {
                            attrs: {
                                type: 'tel', name: 'cellNo', pattern: '([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}',
                                title: 'Must be 10 or more numbers/hyphens long',
                                placeholder: 'Cell Number'
                            }
                        }
                    },
                    'Other Numbers': {
                        dbName: 'otherNos',
                        tagName: 'input',
                        tag: {
                            attrs: {
                                type: 'tel', name: 'otherNos',
                                pattern: '([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}(,\\s([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4})*',
                                title: 'Must be 10 or more numbers/hyphens long. And each number must be separated by a comma and a space',
                                placeholder: 'Other Numbers'
                            }
                        }
                    }
                },
                rows: customer.rows,
                numRows: customer.numRows,
                rowIds: customer.rowIds,
                crudUrl: crudCustomerUrl
            })
        }
    )
    .catch(e => console.error(e))

    // Products
    fetch(crudProductUrl, {
        method: 'POST',
        body: REQUEST_ACTION
    })
    .then(response => response.json())
    .then(
        /**
         * @param {Object} product
         * @param {Object[]} product.rows
         * @param {Object[]} product.rowIds
         * @param {Number} product.numRows
         */
        product => {
            window.DataGrids.Products = new DataGrid({
                table: {
                    name: 'Product',
                    dbName: 'products'
                },
                columns: {
                    'Name': {
                        dbName: 'name',
                        tagName: 'input',
                        tag: {
                            attrs: {
                                type: 'text', name: 'name', pattern: '[A-Za-z\\-\\s]{1,}',
                                title: 'Only letters, hyphens and spaces allowed',
                                placeholder: 'Name', required: ''
                            }
                        }
                    },
                    Description: {
                        dbName: 'desc',
                        tagName: 'textarea',
                        tag: {
                            attrs: {
                                name: 'desc', rows: '4', placeholder: 'Description...'
                            }
                        }
                    },
                    'Image': {
                        dbName: 'image',
                        tagName: 'input',
                        tag: {
                            attrs: {
                                type: 'file', name: 'image',
                                title: 'Only ".jfif", ".jpg", ".jpeg", ".webp", ".gif" and ".png" image file types allowed'
                            }
                        }
                    },
                    Unit: {
                        dbName: 'unit',
                        tagName: 'select',
                        tag: {
                            labelText: 'Units',
                            attrs: { name: 'unit', required: '' },
                            options: [
                                { value: '', textContent: 'Select a unit...' },
                                { value: 'Kilograms (kg)', textContent: 'Kilograms (kg)' },
                                { value: 'Grams (g)', textContent: 'Grams (g)' },
                                { value: 'Pounds (lbs)', textContent: 'Pounds (lbs)' },
                                { value: 'Ounces (oz)', textContent: 'Ounces (oz)' }
                            ]
                        }
                    },
                    'Unit Price ($)': {
                        dbName: 'unitPrice',
                        tagName: 'input',
                        tag: {
                            attrs: {
                                type: 'number', name: 'unitPrice', min: '0.01', step: '0.01',
                                placeholder: 'Unit Price ($)', required: ''
                            }
                        }
                    }
                },
                rows: product.rows,
                numRows: product.numRows,
                rowIds: product.rowIds,
                crudUrl: crudProductUrl
            })
        }
    )
    .catch(e => console.error(e))

    // TODO Integrate RWC Modal & Input Media File
    // TODO Update Product Image
})()