import Checkbox from '../vendors/rui/rui-checkbox.min.js'
import Switch from '../vendors/rui/rui-switch.min.js'
import Input from '../vendors/rui/rui-input.min.js'
import Select from '../vendors/rui/rui-select.min.js'
import Textarea from '../vendors/rui/rui-textarea.min.js'
//* Also dependent on rwc-modal
//* Also dependent on rwc-alert

/**
 * Grid Data
 * @typedef {Object} GridData
 * @property {Object} table The table
 * @property {String} table.name The human readable table name
 * @property {String} table.dbName The database table name
 * @property {Object} columns The columns
 * @property {Object[]} rows The rows
 * @property {Object[]} rowIds The rowIds
 * @property {Number} numRows The number of rows
 * @property {String} crudUrl The path of the php script that
 * handles CRUD operations
 */

export default class {
    /**
     * @param {GridData} data The data to fill the grid
     */
    constructor(data) {
        this.DataGridContainer = document.querySelector(`[data-grid="${data.table.dbName}"]`)
        this.TableName = data.table.name
        this.Columns = data.columns
        this.Rows = data.rows
        this.RowIDs = data.rowIds
        this.NumRows = data.numRows
        this.CrudUrl = data.crudUrl
        this.init()
    }

    init() {
        this.RPPVs = [5, 10, 25, 50, 100] //RowsPerPageValues
        this.RPPDV = 25 //RowsPerPageDefaultValue
        this.ScrollbarWidth = 15
        this.Operations = [
            {
                value: '=',
                textContent: 'equal'
            },
            {
                value: '!=',
                textContent: 'not equal'
            },
            {
                value: '>',
                textContent: 'greater than'
            },
            {
                value: '>=',
                textContent: 'greater than or equal'
            },
            {
                value: '<',
                textContent: 'less than'
            },
            {
                value: '<=',
                textContent: 'less than or equal'
            },
            {
                value: 'contain',
                textContent: 'contain'
            },
            {
                value: 'startWith',
                textContent: 'start with'
            },
            {
                value: 'endWith',
                textContent: 'end with'
            },
            {
                value: 'isEmpty',
                textContent: 'is empty'
            },
            {
                value: 'isNotEmpty',
                textContent: 'is not empty'
            }
        ]
        this.FilterTimer = null

        this.DataGrid = document.createElement('datagrid-rui')
        this.CreateAlert()
        this.CreateToolbar()
        this.CreateMain()
        this.CreateFooter()
        this.DataGridContainer.appendChild(this.DataGrid)

        this.SizeColumns()
        this.SetupAllCheckbox()
        this.SetupCheckboxes()
        this.SetupResizingColumns()
        this.SetupNextPrevBtns()
    } // init()

    CreateAlert() { // 10 lines
        this.Alert = document.createElement('rwc-alert')
        document.body.appendChild(this.Alert)
    }

    CreateToolbar() {
        this.Toolbar = document.createElement('toolbar-rui')

        this.CreateColumnsPanelContainer()
        this.CreateFiltersPanelContainer()
        this.CreateSortsPanelContainer()
        this.CreateNewModal()
        this.CreateDeleteModal()

        this.DataGrid.appendChild(this.Toolbar)
    }

    CreateColumnsPanelContainer() {
        const ColumnsPanelContainer = document.createElement('toolbar-panel-container-rui')

            const ColumnsBtn = document.createElement('button')
            ColumnsBtn.type = 'button'
            ColumnsBtn.value = 0
            ColumnsBtn.className = 'toolbar-btn'
            ColumnsBtn.innerHTML = `<i class="fas fa-columns"></i> Columns`
                const Indicator = document.createElement('indicator-rui')
                Indicator.className = 'hide'
            ColumnsBtn.appendChild(Indicator)

            const ColumnsPanel = document.createElement('toolbar-panel-rui')
            ColumnsPanel.className = 'columns hide'

                const PanelHeader = document.createElement('panel-header-rui')
                PanelHeader.appendChild( Input({
                    attrs: {
                        type: 'text',
                        placeholder: 'Find Column'
                    },
                    evts: {
                        input: function() {
                            const switches = ColumnsPanel.querySelectorAll('label[data-switch-container]')
                            const filter = this.value.trim().toLowerCase()

                            for (const switch_ of switches) {
                                const coltxt = switch_.children[1].textContent.trim().toLowerCase()

                                if (coltxt.indexOf(filter) > -1) switch_.classList.remove('hide')
                                else switch_.classList.add('hide')
                            }
                        }
                    }
                }) )

                const PanelContent = document.createElement('panel-content-rui')
                const Datagrid = this
                for (let i = 0; i < Object.keys(this.Columns).length; i++) {
                    PanelContent.appendChild( Switch({
                        labelText: Object.keys(this.Columns)[i],
                        attrs: { checked: '' },
                        evts: {
                            change: function() {
                                const HCol = Datagrid.HeadingsContainer.querySelectorAll('hcol-rui')[i + 1]
                                const Cols = Datagrid.RowsContainer.querySelectorAll(`[data-colindex="${i}"]`)
                                
                                if (this.checked) {
                                    HCol.classList.remove('hide')
                                    for (const col of Cols) col.classList.remove('hide')
                                    ColumnsBtn.value = +ColumnsBtn.value - 1
                                }
                                else {
                                    HCol.classList.add('hide')
                                    for (const col of Cols) col.classList.add('hide')
                                    ColumnsBtn.value = +ColumnsBtn.value + 1
                                }

                                if (+ColumnsBtn.value > 0) Indicator.classList.remove('hide')
                                else Indicator.classList.add('hide')
                            }
                        }
                    }) )
                }

                const PanelFooter = document.createElement('panel-footer-rui')
                const switches = PanelContent.querySelectorAll('input')
                
                    const HideAllBtn = document.createElement('button')
                    HideAllBtn.type = 'button'
                    HideAllBtn.className = 'panel-btn'
                    HideAllBtn.textContent = 'HIDE ALL'
                    HideAllBtn.addEventListener('click', () => {
                        for (const switch_ of switches) {
                            if (switch_.checked) switch_.click()
                        }
                    })

                    const ShowAllBtn = document.createElement('button')
                    ShowAllBtn.type = 'button'
                    ShowAllBtn.className = 'panel-btn'
                    ShowAllBtn.textContent = 'SHOW ALL'
                    ShowAllBtn.addEventListener('click', () => {
                        for (const switch_ of switches) {
                            if (!switch_.checked) switch_.click()
                        }
                    })

                PanelFooter.appendChild(HideAllBtn)
                PanelFooter.appendChild(ShowAllBtn)

            ColumnsPanel.appendChild(PanelHeader)
            ColumnsPanel.appendChild(PanelContent)
            ColumnsPanel.appendChild(PanelFooter)

            ColumnsBtn.addEventListener('click', e => {
                // Click the filters btn to close it if it's panel is open
                if ( !this.Toolbar.querySelector('toolbar-panel-rui.filters').classList.contains('hide') ) this.Toolbar.querySelectorAll('.toolbar-btn')[1].click()

                // Click the sorts btn to close it if it's panel is open
                if ( !this.Toolbar.querySelector('toolbar-panel-rui.sorts').classList.contains('hide') ) this.Toolbar.querySelectorAll('.toolbar-btn')[2].click()

                if ( !ColumnsPanel.classList.contains('hide') ) return

                e.stopPropagation()
                ColumnsPanel.classList.toggle('hide')
                PanelHeader.querySelector('input').focus()

                /**
                 * @param {MouseEvent} e Click event
                 */
                const cleanup = e => {
                    if (this.ElemIsDescendantOf(e.target, ColumnsPanel) === -1) {
                        ColumnsPanel.classList.add('hide')
                        window.removeEventListener('click', cleanup)
                    }
                }

                window.addEventListener('click', cleanup)
            })

        ColumnsPanelContainer.appendChild(ColumnsBtn)
        ColumnsPanelContainer.appendChild(ColumnsPanel)

        this.Toolbar.appendChild(ColumnsPanelContainer)
    } // CreateColumnsPanelContainer()

    /**
     * Determines whether to hide/display/disable the And/Or operator.
     * @param {HTMLElement} PanelContent 
     */
    SetOperatorVisibility(PanelContent) {
        const Operators = PanelContent.querySelectorAll('[data-operators]')

        if (Operators.length === 1) {
            Operators[0].className = 'mr-_5 hidden'
            return
        }

        for (let i = 0; i < Operators.length; i++) {
            if (i === 0) Operators[i].className = 'mr-_5 invisible'
            else if (i === 1) {
                Operators[i].className = 'mr-_5'
                Operators[i].children[0].removeAttribute('disabled')
            }
            else {
                Operators[i].className = 'mr-_5'
                Operators[i].children[0].setAttribute('disabled','')
            }
        }
    }

    /**
     * Creates a row in the filters panel
     * @param {HTMLElement} PanelContent
     * @param {HTMLButtonElement} FiltersBtn
     * @param {HTMLElement} Indicator
     */
    CreateFilterRow(PanelContent, FiltersBtn, Indicator) {
        const DataGrid = this
        const Row = document.createElement('row-rui')

            const DeleteRow = document.createElement('div')
            DeleteRow.setAttribute('delete-row', '')

                const Btn = document.createElement('button')
                Btn.type = 'button'
                Btn.innerHTML = '&times;'
                Btn.addEventListener('click', function(e) {
                    const numRows = +PanelContent.getAttribute('data-rows')
                    if (numRows > 1) {
                        e.stopPropagation()
                        const row = this.parentElement.parentElement

                        if ( row.hasAttribute('data-has-filter') ) {
                            FiltersBtn.value = +FiltersBtn.value - 1
                            if (+FiltersBtn.value > 0) Indicator.classList.remove('hide')
                            else Indicator.classList.add('hide')
                        }

                        row.remove()
                        DataGrid.SetOperatorVisibility(PanelContent)
                        PanelContent.setAttribute('data-rows', numRows - 1)

                        DataGrid.FilterReadData()
                    }
                    else {
                        const row = this.parentElement.parentElement
                        if ( !row.hasAttribute('data-has-filter') ) return
                        
                        row.removeAttribute('data-has-filter')
                        const columns = row.children[2].children[0]
                        const operations = row.children[3].children[0]
                        const filter = row.children[4].children[0]

                        columns.value = DataGrid.Columns[Object.keys(DataGrid.Columns)[0]].dbName
                        operations.value = DataGrid.Operations[0].value
                        operations.setAttribute('data-value', DataGrid.Operations[0].value)
                        filter.value = null
                        filter.parentElement.classList.remove('invisible')

                        FiltersBtn.value = +FiltersBtn.value - 1
                        if (+FiltersBtn.value > 0) Indicator.classList.remove('hide')
                        else Indicator.classList.add('hide')

                        DataGrid.FilterReadData()
                    }
                })

            DeleteRow.appendChild(Btn)

            const Operator = Select({
                labelText: 'Operators',
                attrs: { class: 'w8' },
                evts: {
                    change: function() {
                        const Ops = PanelContent.querySelectorAll('[data-operators]')
                        for (const Op of Ops) Op.children[0].value = this.value

                        // When to call FilterReadData
                        const row = this.parentElement.parentElement
                        if ( row.hasAttribute('data-has-filter') ) DataGrid.FilterReadData()
                    }
                },
                options: [
                    {
                        value: 'AND',
                        textContent: 'And'
                    },
                    {
                        value: 'OR',
                        textContent: 'Or',
                    }
                ]
            })
            Operator.setAttribute('data-operators', '')
            Operator.className = 'mr-_5 hidden'
            if (PanelContent.children.length > 0) {
                const PrevOp = PanelContent.lastElementChild.children[1].children[0]
                if (PrevOp.value === 'AND') Operator.children[0].value = 'AND'
                else Operator.children[0].value = 'OR'
            }
            
            const colOptions = []
            for (const col in this.Columns) {
                colOptions.push({
                    value: this.Columns[col].dbName,
                    textContent: col
                })
            }
            const Column = Select({
                labelText: 'Columns',
                attrs: { class: 'w14' },
                evts: {
                    change: function() {
                        const row = this.parentElement.parentElement
                        if ( row.hasAttribute('data-has-filter') ) DataGrid.FilterReadData()
                    }
                },
                options: colOptions
            })
            Column.classList.add('mr-_5')

            const Operation = Select({
                labelText: 'Operations',
                attrs: {
                    class: 'w17',
                    'data-value': this.Operations[0].value
                },
                evts: {
                    change: function() {
                        const filterValue = this.parentElement.nextElementSibling.children[0]
                        const row = this.parentElement.parentElement

                        if (this.value === 'isEmpty' || this.value === 'isNotEmpty') {
                            filterValue.parentElement.classList.add('invisible')
                            filterValue.value = null

                            if (!row.hasAttribute('data-has-filter')) {
                                row.setAttribute('data-has-filter', '')
                                FiltersBtn.value = +FiltersBtn.value + 1
                            }
                            
                            DataGrid.FilterReadData()
                        }
                        else if (this.getAttribute('data-value') === 'isEmpty' || this.getAttribute('data-value') === 'isNotEmpty')
                        {
                            filterValue.parentElement.classList.remove('invisible')
                            row.removeAttribute('data-has-filter')

                            FiltersBtn.value = +FiltersBtn.value - 1
                            DataGrid.FilterReadData()
                        }
                        else if (filterValue.value) {
                            DataGrid.FilterReadData()
                        }

                        this.setAttribute('data-value', this.value)

                        if (+FiltersBtn.value > 0) Indicator.classList.remove('hide')
                        else Indicator.classList.add('hide')
                    }
                },
                options: this.Operations
            })
            Operation.classList.add('mr-_5')

        Row.appendChild(DeleteRow)
        Row.appendChild(Operator)
        Row.appendChild(Column)
        Row.appendChild(Operation)
        Row.appendChild(Input({
            attrs: {
                class: 'w18',
                placeholder: 'Filter Value'
            },
            evts: {
                input: function() {
                    clearTimeout(DataGrid.FilterTimer)
                    DataGrid.FilterTimer = setTimeout(() => {
                        if (this.value) {
                            if ( !this.parentElement.parentElement.hasAttribute('data-has-filter') ) {
                                this.parentElement.parentElement.setAttribute('data-has-filter', '')
                                FiltersBtn.value = +FiltersBtn.value + 1
                            }
                        }
                        else {
                            this.parentElement.parentElement.removeAttribute('data-has-filter')
                            FiltersBtn.value = +FiltersBtn.value - 1
                        }

                        if (+FiltersBtn.value > 0) Indicator.classList.remove('hide')
                        else Indicator.classList.add('hide')

                        DataGrid.FilterReadData()
                    }, 1000)
                }
            }
        }))

        PanelContent.appendChild(Row)

        const numRows = +PanelContent.getAttribute('data-rows')
        PanelContent.setAttribute('data-rows', numRows + 1)
    } // CreateFilterRow()
    
    CreateFiltersPanelContainer() {
        const FiltersPanelContainer = document.createElement('toolbar-panel-container-rui')
            const FiltersBtn = document.createElement('button')
            FiltersBtn.type = 'button'
            FiltersBtn.value = 0
            FiltersBtn.className = 'toolbar-btn'
            FiltersBtn.innerHTML = `<i class="fas fa-filter"></i> Filters`
                const Indicator = document.createElement('indicator-rui')
                Indicator.className = 'hide'
            FiltersBtn.appendChild(Indicator)

            const FiltersPanel = document.createElement('toolbar-panel-rui')
            FiltersPanel.className = 'filters hide'

                const PanelContent = document.createElement('panel-content-rui')
                PanelContent.setAttribute('data-rows', 0)
                    this.CreateFilterRow(PanelContent, FiltersBtn, Indicator)
                const PanelFooter = document.createElement('panel-footer-rui')

                    const AddFilterBtn = document.createElement('button')
                    AddFilterBtn.type = 'button'
                    AddFilterBtn.className = 'panel-btn'
                    AddFilterBtn.innerHTML = `<i class="fas fa-plus"></i> ADD FILTER`
                    AddFilterBtn.addEventListener('click', () => {
                        this.CreateFilterRow(PanelContent, FiltersBtn, Indicator)
                        this.SetOperatorVisibility(PanelContent)
                    })

                PanelFooter.appendChild(AddFilterBtn)

            FiltersPanel.appendChild(PanelContent)
            FiltersPanel.appendChild(PanelFooter)

            FiltersBtn.addEventListener('click', e => {
                // Click the columns btn to close it if it's panel is open
                if ( !this.Toolbar.querySelector('toolbar-panel-rui.columns').classList.contains('hide') ) this.Toolbar.querySelectorAll('.toolbar-btn')[0].click()

                 // Click the sorts btn to close it if it's panel is open
                if ( !this.Toolbar.querySelector('toolbar-panel-rui.sorts').classList.contains('hide') ) this.Toolbar.querySelectorAll('.toolbar-btn')[2].click()

                if ( !FiltersPanel.classList.contains('hide') ) return

                e.stopPropagation()
                FiltersPanel.classList.remove('hide')
                PanelContent.querySelector('input').focus()

                /**
                 * @param {MouseEvent} e Click event
                 */
                const cleanup = e => {
                    if (this.ElemIsDescendantOf(e.target, FiltersPanel) === -1) {
                        FiltersPanel.classList.add('hide')
                        window.removeEventListener('click', cleanup)
                    }
                }

                window.addEventListener('click', cleanup)
            })
        
        FiltersPanelContainer.appendChild(FiltersBtn)
        FiltersPanelContainer.appendChild(FiltersPanel)

        this.Toolbar.appendChild(FiltersPanelContainer)
    } // CreateFiltersPanelContainer()

    CreateSortsPanelContainer() {
        const SortsPanelContainer = document.createElement('toolbar-panel-container-rui')
            const SortsBtn = document.createElement('button')
            SortsBtn.type = 'button'
            SortsBtn.value = 0
            SortsBtn.className = 'toolbar-btn'
            SortsBtn.innerHTML = `<i class="fas fa-sort"></i> Sorts`
                const Indicator = document.createElement('indicator-rui')
                Indicator.className = 'hide'
            SortsBtn.appendChild(Indicator)

            const SortsPanel = document.createElement('toolbar-panel-rui')
            SortsPanel.className = 'sorts hide'

                const PanelHeader = document.createElement('panel-header-rui')
                PanelHeader.appendChild( Input({
                    attrs: {
                        type: 'text',
                        placeholder: 'Find Column'
                    },
                    evts: {
                        input: function() {
                            const rows = SortsPanel.querySelectorAll('row-rui')
                            const filter = this.value.trim().toLowerCase()

                            for (const row of rows) {
                                const coltxt = row.children[1].textContent.trim().toLowerCase()

                                if (coltxt.indexOf(filter) > -1) row.classList.remove('hide')
                                else row.classList.add('hide')
                            }
                        }
                    }
                }) )

                const PanelContent = document.createElement('panel-content-rui')

                /**
                 * @param {HTMLElement} row The row
                 * @param {HTMLSelectElement} order The select element that controls the order
                 */
                const unsort = (row, order) => {
                    row.removeAttribute('data-has-sort')
                    order.disabled = true
                    order.value = null
                    order.removeAttribute('data-value')

                    for (let j = 0; j < +SortsBtn.value; j++) {
                        order.children[j].disabled = true
                    }
                }

                const orderOptions = []
                for (let i = 0; i < Object.keys(this.Columns).length; i++) {
                    orderOptions.push({
                        value: i + 1,
                        textContent: i + 1,
                        disabled: ''
                    })
                }
                
                const DataGrid = this
                for (let i = 0; i < Object.keys(this.Columns).length; i++) {
                    const Row = document.createElement('row-rui')

                        const Order =  Select({
                            labelText: 'Order',
                            attrs: {
                                'data-order': '',
                                disabled: ''
                            },
                            evts: {
                                change: function() {
                                    const order = SortsPanel.querySelector(`[data-value="${this.value}"]`)
                                    order.value = this.getAttribute('data-value')
                                    order.setAttribute('data-value', this.getAttribute('data-value'))

                                    this.setAttribute('data-value', this.value)
                                    DataGrid.ReadData()
                                }
                            },
                            options: orderOptions
                        })
                        Order.classList.add('mr-_5')

                        const Column =  document.createElement('span')
                        Column.textContent = Object.keys(this.Columns)[i]
                        Column.title = Object.keys(this.Columns)[i]
                        Column.setAttribute('data-column', this.Columns[ Object.keys(this.Columns)[i] ].dbName)
                        Column.className = 'mr-_5'

                        const Direction = Select({
                            labelText: 'Direction',
                            attrs: {
                                'data-direction': '',
                                class: 'w12'
                            },
                            evts: {
                                change: function() {
                                    const row = this.parentElement.parentElement
                                    const order = row.children[0].children[0]

                                    if (this.value === 'ASC' || this.value === 'DESC') {
                                        if ( !row.hasAttribute('data-has-sort') ) {
                                            SortsBtn.value = +SortsBtn.value + 1
                                            if (+SortsBtn.value > 0) Indicator.classList.remove('hide')
                                            else Indicator.classList.add('hide')
                                        }

                                        row.setAttribute('data-has-sort', '')
                                        order.disabled = false

                                        const _orders = SortsPanel.querySelectorAll('[data-has-sort] [data-order]')

                                        for (const _order of _orders) {
                                            for (let j = 0; j < +SortsBtn.value; j++) {
                                                _order.children[j].disabled = false
                                            }
                                        }

                                        order.value = SortsBtn.value
                                        order.setAttribute('data-value', SortsBtn.value)
                                    }
                                    else {
                                        const orderValue = +order.value
                                        unsort(row, order)

                                        SortsBtn.value = +SortsBtn.value - 1
                                        if (+SortsBtn.value > 0) Indicator.classList.remove('hide')
                                        else Indicator.classList.add('hide')

                                        const _orders = SortsPanel.querySelectorAll('[data-has-sort] [data-order]')

                                        for (const _order of _orders) {
                                            if (+_order.value > orderValue) {
                                                _order.value = +_order.value - 1
                                                _order.setAttribute('data-value', _order.value)
                                            }

                                            _order.children[+SortsBtn.value].disabled = true
                                        }
                                    }

                                    DataGrid.ReadData()
                                }
                            },
                            options: [
                                {
                                    value: 'unsorted',
                                    textContent: 'Unsorted'
                                },
                                {
                                    value: 'ASC',
                                    textContent: 'Ascending'
                                },
                                {
                                    value: 'DESC',
                                    textContent: 'Descending'
                                }
                            ]
                        })
                        Direction.classList.add('mr-_5')

                    Row.appendChild(Order)
                    Row.appendChild(Column)
                    Row.appendChild(Direction)

                    PanelContent.appendChild(Row)
                }

                const PanelFooter = document.createElement('panel-footer-rui')

                    const ResetBtn = document.createElement('button')
                    ResetBtn.type = 'button'
                    ResetBtn.className = 'panel-btn'
                    ResetBtn.textContent = 'RESET ALL'
                    ResetBtn.addEventListener('click', function() {
                        const rows = SortsPanel.querySelectorAll('[data-has-sort]')
                        if (rows.length === 0) return

                        for (const row of rows) {
                            const order = row.children[0].children[0]
                            const direction = row.children[2].children[0]

                            direction.value = 'unsorted'
                            unsort(row, order)
                        }

                        SortsBtn.value = 0
                        Indicator.classList.add('hide')

                        DataGrid.ReadData()
                    })

                PanelFooter.appendChild(ResetBtn)

            SortsPanel.appendChild(PanelHeader)
            SortsPanel.appendChild(PanelContent)
            SortsPanel.appendChild(PanelFooter)

            SortsBtn.addEventListener('click', e => {
                // Click the columns btn to close it if it's panel is open
                if ( !this.Toolbar.querySelector('toolbar-panel-rui.columns').classList.contains('hide') ) this.Toolbar.querySelectorAll('.toolbar-btn')[0].click()

                 // Click the filters btn to close it if it's panel is open
                if ( !this.Toolbar.querySelector('toolbar-panel-rui.filters').classList.contains('hide') ) this.Toolbar.querySelectorAll('.toolbar-btn')[1].click()

                if ( !SortsPanel.classList.contains('hide') ) return

                e.stopPropagation()
                SortsPanel.classList.remove('hide')

                /**
                 * @param {MouseEvent} e Click event
                 */
                const cleanup = e => {
                    if (this.ElemIsDescendantOf(e.target, SortsPanel) === -1) {
                        SortsPanel.classList.add('hide')
                        window.removeEventListener('click', cleanup)
                    }
                }

                window.addEventListener('click', cleanup)
            })

        SortsPanelContainer.appendChild(SortsBtn)
        SortsPanelContainer.appendChild(SortsPanel)

        this.Toolbar.appendChild(SortsPanelContainer)
    } // CreateSortsPanelContainer()

    /**
     * Converts an HTML string to actual DOM node(s)
     * @param {String} htmlString The HTML string
     * @returns {HTMLCollection}
     */
    HTMLStringToNode(htmlString) {
        const div = document.createElement('div')
        div.innerHTML = htmlString
        return div.children
    }

    CreateNewModal() {
        this.NewModal = document.createElement('rwc-modal')
        this.NewModal.modalOutlineColor = 'hsl(93, 98%, 30%)'
        this.NewModal.innerHTML = `
            <span slot="heading">Add New ${this.TableName}</span>
            <div slot="body-content"><form></form></div>
        `
        const form = this.NewModal.querySelector('form')

        for (const col in this.Columns) {
            switch (this.Columns[col].tagName) {
                case 'input': {
                    form.appendChild( Input(this.Columns[col].tag) )
                    break
                }
                case 'textarea': {
                    form.appendChild( Textarea(this.Columns[col].tag) )
                    break
                }
                case 'select': {
                    form.appendChild( Select(this.Columns[col].tag) )
                    break
                }
                default: console.error(`Invalid tag name: ${this.Columns[col].tagName}`)
            }
        }
        
        form.append(...this.HTMLStringToNode(`
            <div class="reset-submit">
                <button type="reset" class="red">RESET</button>
                <button type="submit" class="green">SUBMIT</button>
            </div>
        `))

        const DataGrid = this
        form.addEventListener('submit', function(e) {
            e.preventDefault()

            DataGrid.Alert.closeAlert()

            const data = new FormData(this)
            data.append('REQUEST_ACTION', 'CREATE')

            fetch(DataGrid.CrudUrl, {
                method: 'POST',
                body: data
            })
            .then(respJSON => respJSON.json())
            .then(
                /**
                 * @param {Object} resp
                 * @param {Boolean} resp.success
                 * @param {String|Object} resp.message
                 */
                resp => {
                    if (resp.success) {
                        DataGrid.NewModal.querySelector('form').reset()
                        DataGrid.ReadData()

                        DataGrid.Alert.innerHTML = `
                            <span slot="status">Success!</span>
                            <span slot="message">${resp.message}</span>
                        `
                        DataGrid.Alert.alertColor = '#bdd9a6'
                        DataGrid.Alert.openAlert()
                    }
                    else {
                        console.error(resp)
                        
                        const message = typeof resp.message === 'object'
                            ? 'Invalid data detected! Please remove invalid data and submit again.'
                            : 'Something went wrong. Please try again later.'

                        DataGrid.Alert.innerHTML = `
                            <span slot="status">Failure!</span>
                            <span slot="message">${message}</span>
                        `
                        DataGrid.Alert.alertColor = '#d9a6af'
                        DataGrid.Alert.openAlert()
                    }
                }
            )
            .catch(e => console.error(e))
        })

        document.body.appendChild(this.NewModal)

        // New Button
        const newBtn = this.HTMLStringToNode(`
            <button type="button" class="toolbar-btn new">
                <i class="fas fa-plus"></i> New
            </button>
        `)[0]
        newBtn.addEventListener('click', () => this.NewModal.openModal())
        this.Toolbar.appendChild(newBtn)
    } // CreateNewModal()

    CreateDeleteModal() {
        this.DeleteModal = document.createElement('rwc-modal')
        this.DeleteModal.modalOutlineColor = 'hsl(349, 84%, 65%)'
        this.DeleteModal.innerHTML = `
            <span slot="heading"></span>
            <div slot="body-content">
                <div class="body-text"></div>
                <form>
                    <div class="reset-submit">
                        <button type="reset" class="green">CANCEL</button>
                        <button type="submit" class="red">DELETE</button>
                    </div>
                </form>
            </div>
        `
        document.body.appendChild(this.DeleteModal)

        this.DeleteModal.querySelector('button[type="reset"]').addEventListener('click', () => this.DeleteModal.Modal.classList.remove('open'))

        const DataGrid = this
        const form = this.DeleteModal.querySelector('form')
        form.addEventListener('submit', function(e) {
            e.preventDefault()

            DataGrid.Alert.closeAlert()

            const ids = []
            const selectedRows = DataGrid.RowsContainer.querySelectorAll('row-rui.selected')

            for (const selectedRow of selectedRows) ids.push( +selectedRow.getAttribute('data-entity-id') )

            const data = new FormData()
            data.append('REQUEST_ACTION', 'DELETE')
            data.append('ids', JSON.stringify(ids))
            
            fetch(DataGrid.CrudUrl, {
                method: 'POST',
                body: data
            })
            .then(respJSON => respJSON.json())
            .then(
                /**
                 * @param {Object} resp
                 * @param {Boolean} resp.success
                 * @param {String} resp.message
                 */
                resp => {
                    if (resp.success) {
                        DataGrid.DeleteModal.closeModal()
                        DataGrid.ReadData()
                        
                        DataGrid.Alert.innerHTML = `
                            <span slot="status">Success!</span>
                            <span slot="message">${resp.message}</span>
                        `
                        DataGrid.Alert.alertColor = '#bdd9a6'
                        DataGrid.Alert.openAlert()
                    }
                    else {
                        console.error(resp.message)

                        const message = resp.message === 'Invalid ID(s)!'
                            ? 'Invalid ID(s) detected! Please remove invalid ID(s) and try again.'
                            : 'Something went wrong. Please try again later.'

                        
                        DataGrid.Alert.innerHTML = `
                            <span slot="status">Failure!</span>
                            <span slot="message">${message}</span>
                        `
                        DataGrid.Alert.alertColor = '#d9a6af'
                        DataGrid.Alert.openAlert()
                    }
                }
            )
            .catch(e => console.error(e))
        })

        // Delete Button
        const deleteBtn = this.HTMLStringToNode(`
            <button type="button" class="toolbar-btn del">
                <i class="far fa-trash-alt"></i> Delete
            </button>
        `)[0]
        deleteBtn.addEventListener('click', () => {
            const numSelectedRows = +this.Footer.querySelector('num-selected-rows-rui').textContent.split(' row')[0]
            const headerText = this.DeleteModal.querySelector('[slot="heading"]')
            const bodyText = this.DeleteModal.querySelector('.body-text')
            const delBtn = this.DeleteModal.querySelector('button[type="submit"]')

            if (numSelectedRows === 0) {
                headerText.textContent = 'No Rows Selected!'
                bodyText.textContent = 'Please select some row(s) first then click delete.'
                delBtn.disabled = true
            }
            else {
                headerText.textContent = 'Are You Sure?'
                bodyText.textContent = `Are you sure you want to permanently delete ${numSelectedRows === 1 ? '1 row' : numSelectedRows + ' rows'}? This action cannot be undone!`
                delBtn.disabled = false
            }

            this.DeleteModal.openModal()
        })
        this.Toolbar.appendChild(deleteBtn)
    } // CreateDeleteModal()

    CreateMain() {
        this.Main = document.createElement('main-rui')
        this.CreateHeadingsContainer()
        this.CreateRowsContainer()
        this.DataGrid.appendChild(this.Main)
    }

    /**
     * Convert px to rem units
     * @param {Number | String} px the length in px
     * @returns {Number} the length in rem
     */
    PxToRem(px) {
        if (window.innerWidth >= 2700) return (+px / 15)
        if (window.innerWidth >= 1800) return (+px / 12.5)
        if (window.innerWidth >= 900 ) return (+px / 10)
        return (+px / 7.5)
    }

    CreateHeadingsContainer() {
        this.HeadingsContainer = document.createElement('headings-container-rui')
            const Headings = document.createElement('headings-rui')

                const HCol = document.createElement('hcol-rui')
                HCol.className = 'select-column'
                HCol.appendChild( Checkbox({
                    attrs: {
                        'data-checkbox-group-all': '',
                        'data-checkbox-selected-count': 0
                    }
                }) )
            Headings.appendChild(HCol)

                for (let i = 0; i < Object.keys(this.Columns).length; i++) {
                    const HCol = document.createElement('hcol-rui')
                    HCol.setAttribute('data-column', this.Columns[ Object.keys(this.Columns)[i] ].dbName)

                    // Determines how wide a column should be
                    const tempDiv = document.createElement('div')
                    tempDiv.textContent = Object.keys(this.Columns)[i]
                    tempDiv.style.display = 'inline-block'
                    tempDiv.style.opacity = 0
                    document.body.appendChild(tempDiv)
                    const width = this.PxToRem(tempDiv.scrollWidth + 24)
                    document.body.removeChild(tempDiv)

                    // 5rem is the minimum column width
                    HCol.style.minWidth = width >= 5 ? `${width}rem` : '5rem'
                    HCol.style.maxWidth = width >= 5 ? `${width}rem` : '5rem'

                        const HeadingTitle = document.createElement('heading-title-rui')
                        HeadingTitle.textContent = Object.keys(this.Columns)[i]

                        const Resizable = document.createElement('resizable-rui')
                        Resizable.setAttribute('data-colindex', i)
                            const ResizableIcon = document.createElement('resizable-icon-rui')
                        Resizable.appendChild(ResizableIcon)
                    
                    HCol.appendChild(HeadingTitle)
                    HCol.appendChild(Resizable)
                    Headings.appendChild(HCol)
                }

        this.HeadingsContainer.appendChild(Headings)
        this.Main.appendChild(this.HeadingsContainer)
    }

    CreateRowsContainer() {
        this.RowsContainer = document.createElement('rows-container-rui')
        this.BoundColumnNavigate = this.ColumnNavigate.bind(this)
        this.BoundColumnEdit = this.ColumnEdit.bind(this)
        this.CreateRows()
        this.Main.appendChild(this.RowsContainer)

        this.RowsContainer.addEventListener('scroll', () => {
            this.HeadingsContainer.children[0].style.transform = `translateX(-${this.RowsContainer.scrollLeft}px)`
        })
    }

    /**
     * Scroll parent element if element is partially
     * or fully offscreen to the left or right
     * @param {HTMLInputElement} el The element to keep in view
     * @param {HTMLElement} containerEl The parent element to scroll if need be
     */
    KeepElementInView(el, containerEl) {
        // If this element is offscreen to the right
        if ( (el.offsetLeft + el.offsetWidth - containerEl.offsetLeft) > (containerEl.offsetWidth - this.ScrollbarWidth + containerEl.scrollLeft) ) {
            containerEl.scrollLeft = el.offsetLeft + el.offsetWidth - containerEl.offsetLeft - containerEl.offsetWidth + this.ScrollbarWidth + 1
        }
        // If this element is offscreen to the left
        else if ( (el.offsetLeft - containerEl.offsetLeft) < containerEl.scrollLeft ) {
            containerEl.scrollLeft = el.offsetLeft - containerEl.offsetLeft - 1
        }
    }

    /**
     * @param {KeyboardEvent} e The key down event
     */
    ColumnNavigate(e) {
        e.preventDefault()

        switch (e.key) {
            case 'ArrowUp' :
                if (this.FocusedCol.parentElement.previousElementSibling) {
                    this.FocusedCol.parentElement.previousElementSibling.querySelector(`[data-colindex="${this.FocusedCol.getAttribute('data-colindex')}"]`).focus()
                }
                break
            case 'ArrowDown' :
                if (this.FocusedCol.parentElement.nextElementSibling) {
                    this.FocusedCol.parentElement.nextElementSibling.querySelector(`[data-colindex="${this.FocusedCol.getAttribute('data-colindex')}"]`).focus()
                }
                break
            case 'ArrowLeft' :
                for (
                    let curElem = this.FocusedCol.previousElementSibling;
                    curElem.hasAttribute('data-colindex');
                    curElem = curElem.previousElementSibling
                ) {
                    if (!curElem.classList.contains('hide')) {
                        curElem.focus()
                        this.KeepElementInView(this.FocusedCol, this.RowsContainer)
                        break
                    }
                }
                break
            case 'ArrowRight' :
                for (
                    let curElem = this.FocusedCol.nextElementSibling;
                    curElem !== null;
                    curElem = curElem.nextElementSibling
                ) {
                    if (!curElem.classList.contains('hide')) {
                        curElem.focus()
                        this.KeepElementInView(this.FocusedCol, this.RowsContainer)
                        break
                    }
                }
                break
            case 'Home' :
                for (
                    let curElem = this.FocusedCol.parentElement.querySelector('[data-colindex="0"]');
                    curElem !== null;
                    curElem = curElem.nextElementSibling
                ) {
                    if (!curElem.classList.contains('hide')) {
                        curElem.focus()
                        this.KeepElementInView(this.FocusedCol, this.RowsContainer)
                        break
                    }
                }
                break
            case 'End' :
                for (
                    let curElem = this.FocusedCol.parentElement.querySelector(`[data-colindex="${this.FocusedCol.parentElement.children.length - 2}"]`);
                    curElem.hasAttribute('data-colindex');
                    curElem = curElem.previousElementSibling
                ) {
                    if (!curElem.classList.contains('hide')) {
                        curElem.focus()
                        this.KeepElementInView(this.FocusedCol, this.RowsContainer)
                        break
                    }
                }
                break
            case 'PageUp' :
                this.RowsContainer.querySelector(`[data-rowindex="0"] [data-colindex="${this.FocusedCol.getAttribute('data-colindex')}"]`).focus()
                break
            case 'PageDown' :
                this.RowsContainer.querySelector(`[data-rowindex="${+this.Pagination.querySelector('offset-max-rui').textContent - 1}"] [data-colindex="${this.FocusedCol.getAttribute('data-colindex')}"]`).focus()
                break
            case 'Enter' :
                this.FocusedCol.tagName === 'INPUT'
                    ? this.FocusedCol.dispatchEvent(new MouseEvent('dblclick'))
                    : this.FocusedCol.dispatchEvent(new MouseEvent('click'))
                break
            default :
        }
    }

    /** 
     * @param {KeyboardEvent} e The key down event
     */
    ColumnEdit(e) {
        if (e.key !== 'Escape' && e.key !== 'Enter') return

        let isFocused = false

        if (this.FocusedCol.nextElementSibling) {
            for (
                let curElem = this.FocusedCol.nextElementSibling;
                curElem !== null;
                curElem = curElem.nextElementSibling
            ) {
                if (!curElem.classList.contains('hide')) {
                    curElem.focus()
                    isFocused = true
                    break
                }
            }
        }

        if (!isFocused && this.FocusedCol.parentElement.nextElementSibling) {
            for (
                let curElem = this.FocusedCol.parentElement.nextElementSibling.querySelector('[data-colindex="0"]');
                curElem !== null;
                curElem = curElem.nextElementSibling
            ) {
                if (!curElem.classList.contains('hide')) {
                    curElem.focus()
                    isFocused = true
                    break
                }
            }
        }

        if (!isFocused) {
            this.FocusedCol.blur()
            this.FocusedCol.focus()
        }

        this.KeepElementInView(this.FocusedCol, this.RowsContainer)
    }

    /**
     * Resize a given column to the given width
     * @param {HTMLElement} col The column to resize
     * @param {Number} newPxWidth The width in px to resize to
     */
    ResizeColumn(col, newPxWidth) {
        const newRemWidth = this.PxToRem(newPxWidth)
        const HCol = this.HeadingsContainer.children[0].children[+col.getAttribute('data-colindex') + 1]
        const Cols = this.RowsContainer.querySelectorAll(`[data-colindex="${col.getAttribute('data-colindex')}"]`)

        HCol.style.minWidth = `${newRemWidth}rem`
        HCol.style.maxWidth = `${newRemWidth}rem`

        for (const Col of Cols) {
            Col.style.minWidth = `${newRemWidth}rem`
            Col.style.maxWidth = `${newRemWidth}rem`
        }
    }

    /**
     * Creates a row in the datagrid
     * @param {Number} i
     * @param {Number} j
     * @param {String} col
     * @returns {HTMLInputElement}
     */
    CreateInputCols(i, j, col) {
        const DataGrid = this
        const Col = document.createElement('input')

        Col.setAttribute('data-colindex', j)
        Col.value = this.Rows[i][col] ? this.Rows[i][col] : ''
        Col.setAttribute('data-value', this.Rows[i][col] ? this.Rows[i][col] : '')
        Col.readOnly = true

        Col.addEventListener('focus', function() { DataGrid.FocusedCol = this })
        Col.addEventListener('keydown', this.BoundColumnNavigate)

        Col.addEventListener('blur', function() {
            if (this.readOnly) return

            this.readOnly = true
            this.removeEventListener('keydown', DataGrid.BoundColumnEdit)
            this.addEventListener('keydown', DataGrid.BoundColumnNavigate)

            if (this.value === this.getAttribute('data-value')) return

            // Close alert if it was open
            DataGrid.Alert.closeAlert()

            const data = new FormData()
            data.append('REQUEST_ACTION', 'UPDATE')
            data.append('id', +this.parentElement.getAttribute('data-entity-id'))
            data.append('column', DataGrid.HeadingsContainer.children[0].children[+this.getAttribute('data-colindex') + 1].getAttribute('data-column'))
            data.append('value', this.value)

            fetch(DataGrid.CrudUrl, {
                method: 'POST',
                body: data
            })
            .then(respJSON => respJSON.json())
            .then(
                /**
                 * @param {Object} resp
                 * @param {Boolean} resp.success
                 * @param {String} resp.message
                 */
                resp => {
                    if (resp.success) {     
                        this.setAttribute('data-value', this.value)

                        DataGrid.Alert.innerHTML = `
                            <span slot="status">Success!</span>
                            <span slot="message">${resp.message}</span>
                        `
                        DataGrid.Alert.alertColor = '#bdd9a6'
                        DataGrid.Alert.openAlert()
                    }
                    else {
                        console.error(resp.message)

                        const message = resp.message === 'Invalid column data'
                            ? 'Invalid column data detected! Please remove invalid data and submit again.'
                            : 'Something went wrong. Please try again later.'
                        
                        DataGrid.Alert.innerHTML = `
                            <span slot="status">Failure!</span>
                            <span slot="message">${message}</span>
                        `
                        DataGrid.Alert.alertColor = '#d9a6af'
                        DataGrid.Alert.openAlert()
                    }
                }
            )
            .catch(e => console.error(e))
        }) // addEventListener('blur)

        Col.addEventListener('dblclick', function() {
            if (!this.readOnly) return

            if (this.scrollWidth > this.offsetWidth) DataGrid.ResizeColumn(this, this.scrollWidth + 10)

            this.removeEventListener('keydown', DataGrid.BoundColumnNavigate)
            this.readOnly = false

            this.setSelectionRange(this.value.length, this.value.length)
            DataGrid.KeepElementInView(this, DataGrid.RowsContainer)

            this.addEventListener('keydown', DataGrid.BoundColumnEdit)
        })

        return Col
    } // CreateInputCols()

    /**
     * Creates a row in the datagrid
     * @param {Number} i
     * @param {Number} j
     * @param {String} col
     * @returns {HTMLInputElement}
     */
    CreateInputFileImageCols(i, j, col) {
        const DataGrid = this
        let Col = null

        if (this.Rows[i][col]) { 
            Col = this.HTMLStringToNode(`
                <div class="image" data-colindex="${j}" tabindex="0">
                    <label>
                        <input type="file" name="${col}" accept="image/*">
                        <img src="${this.Rows[i][col]}" ${i <= 3 ? `class="top"` : ''}>
                    </label>
                    <button type="button" title="Remove image">&times;</button>
                </div>
            `)[0]

            Col.style.zIndex = i <= 3 ? ((i - 3) * -1) : ''
            Col.querySelector('button').addEventListener('click', function() {
                const data = new FormData()
                data.append('REQUEST_ACTION', 'UPDATE')
                data.append('id', +DataGrid.RowIDs[i][Object.keys(DataGrid.RowIDs[i])[0]])
                data.append('column', col)
                data.append('value', '')
                data.append(col, new File([], ''))

                fetch(DataGrid.CrudUrl, {
                    method: 'POST',
                    body: data
                })
                .then(respJSON => respJSON.json())
                .then(
                    /**
                     * @param {Object} resp
                     * @param {Boolean} resp.success
                     * @param {String} resp.message
                     */
                    resp => {
                        if (resp.success) {     
                            DataGrid.ReadData()
                            DataGrid.Alert.innerHTML = `
                                <span slot="status">Success!</span>
                                <span slot="message">${resp.message}</span>
                            `
                            DataGrid.Alert.alertColor = '#bdd9a6'
                            DataGrid.Alert.openAlert()
                        }
                        else {
                            console.error(resp.message)
    
                            const message = resp.message === 'Invalid column data'
                                ? 'Image upload failed! Please try to upload the image again.'
                                : 'Something went wrong. Please try again later.'
                            
                            DataGrid.Alert.innerHTML = `
                                <span slot="status">Failure!</span>
                                <span slot="message">${message}</span>
                            `
                            DataGrid.Alert.alertColor = '#d9a6af'
                            DataGrid.Alert.openAlert()
                        }
                    }
                )
            })
        }
        else {
            Col = this.HTMLStringToNode(`
                <label class="image" data-colindex="${j}" tabindex="0">
                    <input type="file" name="${col}" accept="image/*">
                </label>
            `)[0]
        }
        
        Col.addEventListener('focus', function() { DataGrid.FocusedCol = this })
        Col.addEventListener('keydown', this.BoundColumnNavigate)

        Col.querySelector('input').addEventListener('change', function() {
            const data = new FormData()
            data.append('REQUEST_ACTION', 'UPDATE')
            data.append('id', +DataGrid.RowIDs[i][Object.keys(DataGrid.RowIDs[i])[0]])
            data.append('column', col)
            data.append('value', this.value)
            data.append(col, this.files[0])

            fetch(DataGrid.CrudUrl, {
                method: 'POST',
                body: data
            })
            .then(respJSON => respJSON.json())
            .then(
                /**
                 * @param {Object} resp
                 * @param {Boolean} resp.success
                 * @param {String} resp.message
                 */
                resp => {
                    if (resp.success) {     
                        DataGrid.ReadData()
                        DataGrid.Alert.innerHTML = `
                            <span slot="status">Success!</span>
                            <span slot="message">${resp.message}</span>
                        `
                        DataGrid.Alert.alertColor = '#bdd9a6'
                        DataGrid.Alert.openAlert()
                    }
                    else {
                        console.error(resp.message)

                        const message = (
                            resp.message === 'Invalid column data' ||
                            resp.message === 'Error uploading file'
                        )
                            ? 'Image upload failed! Please try to upload the image again.'
                            : 'Something went wrong. Please try again later.'
                        
                        DataGrid.Alert.innerHTML = `
                            <span slot="status">Failure!</span>
                            <span slot="message">${message}</span>
                        `
                        DataGrid.Alert.alertColor = '#d9a6af'
                        DataGrid.Alert.openAlert()
                    }
                }
            )
        })

        return Col
    } // CreateInputFileImageCols()

    CreateRows() {
        this.RowsContainer.innerHTML = null

        for (let i = 0; i < this.Rows.length; i++) {
            const Row = document.createElement('row-rui')
            Row.setAttribute('data-rowindex', i)
            Row.setAttribute('data-entity-id', this.RowIDs[i][Object.keys(this.RowIDs[i])[0]])

                const Col = document.createElement('col-rui')
                Col.className = 'select-column'
                Col.appendChild(Checkbox({ attrs: { 'data-checkbox-group-single': ''} }))

            Row.appendChild(Col)

                let j = 0
                for (let col in this.Rows[i]) {
                    const colObj = this.Columns[Object.keys(this.Columns)[j]]
                    
                    if (colObj.otherInfo === 'images') Row.appendChild(this.CreateInputFileImageCols(i, j, col))
                    else Row.appendChild(this.CreateInputCols(i, j, col))

                    j++
                }

            this.RowsContainer.appendChild(Row)
        }
    }

    CreateFooter() {
        this.Footer = document.createElement('footer-rui')
        
            const NumSelectedRows = document.createElement('num-selected-rows-rui')
            NumSelectedRows.textContent = '0 rows selected'

        this.Footer.appendChild(NumSelectedRows)
        this.CreatePagination()
        this.DataGrid.appendChild(this.Footer)
    }

    CreatePagination() {
        this.Pagination = document.createElement('pagination-rui')

            const p = document.createElement('p')
            p.className = 'rows-per-page'
            p.textContent = 'Rows per page:'

            const RowsPerPage = () => {
                const options = []
                
                for (const val of this.RPPVs) {
                    if (val === this.RPPDV) {
                        options.push({
                            value: val,
                            textContent: val,
                            selected: ''
                        })
                    }
                    else {
                        options.push({
                            value: val,
                            textContent: val
                        })
                    }
                }

                const DataGrid = this
                return Select({
                    attrs: { 'data-rows-per-page-value': '' },
                    evts: {
                        change: function() {
                            const OffsetMin = DataGrid.DataGrid.querySelector('offset-min-rui')
                            const OffsetMax = DataGrid.DataGrid.querySelector('offset-max-rui')
                            const NextPageBtn = DataGrid.DataGrid.querySelector('button[title="Go to next page"]')
                            const newOffsetMaxVal = +OffsetMin.textContent + +this.value - 1

                            if (newOffsetMaxVal <= DataGrid.NumRows) {
                                OffsetMax.textContent = newOffsetMaxVal
                            }
                            else {
                                OffsetMax.textContent = DataGrid.NumRows
                            }
                            if (+OffsetMax.textContent === DataGrid.NumRows) {
                                NextPageBtn.disabled = true
                            }
                            else NextPageBtn.disabled = false

                            DataGrid.ReadData()
                        }
                    },
                    options
                })
            } //RowsPerPage()

            const DisplayedRows = document.createElement('displayed-rows-rui')
            DisplayedRows.innerHTML = `<offset-min-rui>${this.NumRows > 0 ? 1 : 0}</offset-min-rui>-<offset-max-rui>${this.NumRows >= this.RPPDV ? this.RPPDV : this.NumRows}</offset-max-rui> of <num-rows-rui>${this.NumRows}</num-rows-rui>`

            const PaginationActions = () => {
                const PaginationActions = document.createElement('pagination-actions-rui')

                    this.PrevPageBtn = document.createElement('button')
                    this.PrevPageBtn.type = 'button'
                    this.PrevPageBtn.title = 'Go to previous page'
                    this.PrevPageBtn.disabled = true
                    this.PrevPageBtn.innerHTML = `<i class="fas fa-chevron-left"></i>`

                    this.NextPageBtn = document.createElement('button')
                    this.NextPageBtn.type = 'button'
                    this.NextPageBtn.title = 'Go to next page'
                    this.NextPageBtn.disabled = this.NumRows <= this.RPPDV
                    this.NextPageBtn.innerHTML = `<i class="fas fa-chevron-right"></i>`

                PaginationActions.appendChild(this.PrevPageBtn)
                PaginationActions.appendChild(this.NextPageBtn)

                return PaginationActions
            }

        this.Pagination.appendChild(p)
        this.Pagination.appendChild( RowsPerPage() )
        this.Pagination.appendChild(DisplayedRows)
        this.Pagination.appendChild( PaginationActions() )
        this.Footer.appendChild(this.Pagination)
    } // CreatePagination()

    SizeColumns() {
        const HCols = this.HeadingsContainer.querySelectorAll('hcol-rui')
        const Rows = this.RowsContainer.querySelectorAll('row-rui')

        for (const row of Rows) {
            for (let i = 1; i < row.children.length; i++) {
                row.children[i].style.minWidth = HCols[i].style.minWidth
                row.children[i].style.maxWidth = HCols[i].style.maxWidth
            }
        }
    }

    HideColumns() {
        const HCols = this.HeadingsContainer.querySelectorAll('hcol-rui.hide')

        for (const hcol of HCols) {
            const i = +hcol.children[1].getAttribute('data-colindex')
            const Cols = this.RowsContainer.querySelectorAll(`[data-colindex="${i}"]`)
            for (const col of Cols) col.classList.add('hide')
        }
    }

    SetupAllCheckbox() {
        const allCheckbox = this.DataGrid.querySelector('[data-checkbox-group-all]')
        const Datagrid = this

        allCheckbox.addEventListener('change', function() {
            const checkboxes = Datagrid.RowsContainer.querySelectorAll('[data-checkbox-group-single]')

            if (this.checked) {
                for (const checkbox of checkboxes) {
                    if (!checkbox.checked) checkbox.click()
                }
            }
            else {
                for (const checkbox of checkboxes) {
                    if (checkbox.checked) checkbox.click()
                }
            }
        })
    }

    SetupCheckboxes() {
        const allCheckbox = this.DataGrid.querySelector('[data-checkbox-group-all]')
        const Icon = allCheckbox.nextElementSibling
        const checkboxes = this.DataGrid.querySelectorAll('[data-checkbox-group-single]')
        const NumSelectedRows = this.DataGrid.querySelector('num-selected-rows-rui')
        const DataGrid = this

        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].addEventListener('change', function() {
                let selectedCount = +allCheckbox.getAttribute('data-checkbox-selected-count')

                if (this.checked) {
                    DataGrid.RowsContainer.children[i].classList.add('selected')
                    selectedCount++
                    allCheckbox.setAttribute('data-checkbox-selected-count', selectedCount)
                }
                else {
                    DataGrid.RowsContainer.children[i].classList.remove('selected')
                    selectedCount--
                    allCheckbox.setAttribute('data-checkbox-selected-count', selectedCount)
                }

                if (selectedCount === 0) {
                    allCheckbox.checked = false
                    Icon.className = 'far fa-square icon'
                }
                else if (selectedCount === checkboxes.length) {
                    allCheckbox.checked = true
                    Icon.className = 'fas fa-check-square icon checked'
                }
                else {
                    allCheckbox.checked = true
                    Icon.className = 'fas fa-minus-square icon checked'
                }

                NumSelectedRows.textContent = selectedCount === 1 ? `${selectedCount} row selected` : `${selectedCount} rows selected`
            })
        }
    }

    SetupResizingColumns() {
        const DataGrid = this
        const Headings = this.DataGrid.querySelector('headings-rui')
        const Resizables = Headings.querySelectorAll('resizable-rui')

        // *** Resizing Columns ***
        const curPos = {
            x: 0,
            colIndex: 0,
            minWidth: 5, //5rem
            minLeft: 0
        }

        /**
         * @param {MouseEvent} e 
         */
        const resizeCols = e => {
            const HCol = Headings.querySelectorAll('hcol-rui')[curPos.colIndex + 1]
            const HColWidth = HCol.getBoundingClientRect().width

            // Stops resizing when cursors moves to the left of the resizable icon
            if (( this.PxToRem(HColWidth) ) === curPos.minWidth) {
                curPos.minLeft = curPos.minLeft < 0 ? e.clientX : curPos.minLeft
            }
            if (e.clientX < curPos.minLeft) return

            const diff = e.clientX - curPos.x
            curPos.x = e.clientX
            const newWidth = this.PxToRem(HColWidth + diff)
            
            if (newWidth < curPos.minWidth) return

            HCol.style.minWidth = `${newWidth}rem`
            HCol.style.maxWidth = `${newWidth}rem`

            const Cols = this.RowsContainer.querySelectorAll(`[data-colindex="${curPos.colIndex}"]`)
            for (let col of Cols) {
                col.style.minWidth = `${newWidth}rem`
                col.style.maxWidth = `${newWidth}rem`
            }
        }

        const cleanup = () => {
            Headings.querySelector('resizable-rui.active').classList.remove('active')
            window.removeEventListener('mousemove', resizeCols)
            window.removeEventListener('mouseup', cleanup)
        }
        
        for (let i = 0; i < Resizables.length; i++) {
            Resizables[i].addEventListener('mousedown', function(e) {
                curPos.x = e.clientX
                curPos.colIndex = +this.getAttribute('data-colindex')
                curPos.minLeft = -1

                this.classList.add('active')
                window.addEventListener('mousemove', resizeCols)
                window.addEventListener('mouseup', cleanup)
            })

            Resizables[i].addEventListener('dblclick', function(e) {
                let maxScrollWidth = this.previousElementSibling.scrollWidth
                const cols = DataGrid.RowsContainer.querySelectorAll(`[data-colindex="${this.getAttribute('data-colindex')}"]`)

                for (const col of cols) {
                    if ( (col.scrollWidth + 1) > maxScrollWidth ) {
                        maxScrollWidth = col.scrollWidth + 1
                    }
                }

                if (maxScrollWidth > this.previousElementSibling.offsetWidth) {
                    DataGrid.ResizeColumn(cols[0], maxScrollWidth + 10)
                }
            })
        }
    }

    SetupNextPrevBtns() {
        const RowsPerPage = this.Pagination.querySelector('[data-rows-per-page-value]')
        const OffsetMin = this.Pagination.querySelector('offset-min-rui')
        const OffsetMax = this.Pagination.querySelector('offset-max-rui')
        const DataGrid = this

        this.NextPageBtn.addEventListener('click', function() {
            const newOffsetMinVal = +OffsetMin.textContent + +RowsPerPage.value
            const newOffsetMaxVal = +OffsetMax.textContent + +RowsPerPage.value

            if (newOffsetMinVal > DataGrid.NumRows) {
                if (+RowsPerPage.value <= DataGrid.NumRows) {
                    OffsetMin.textContent = newOffsetMinVal
                }
            }
            else OffsetMin.textContent = newOffsetMinVal

            if (newOffsetMaxVal > DataGrid.NumRows) {
                OffsetMax.textContent = DataGrid.NumRows
                this.disabled = true
            }
            else OffsetMax.textContent = newOffsetMaxVal

            DataGrid.PrevPageBtn.disabled = false
            DataGrid.ReadData()
        })

        this.PrevPageBtn.addEventListener('click', function() {
            const newOffsetMinVal = +OffsetMin.textContent - +RowsPerPage.value
            let newOffsetMaxVal = +OffsetMax.textContent - +RowsPerPage.value
            let disabled = false

            this.disabled = newOffsetMinVal <= 1
            if (newOffsetMinVal < 1) {
                if (DataGrid.NumRows > 0) OffsetMin.textContent = 1
                else OffsetMin.textContent = 0
            }
            else OffsetMin.textContent = newOffsetMinVal

            if (+OffsetMax.textContent === DataGrid.NumRows) {
                newOffsetMaxVal = +OffsetMin.textContent + +RowsPerPage.value - 1
                
                if (newOffsetMaxVal > DataGrid.NumRows) {
                    OffsetMax.textContent = DataGrid.NumRows
                    disabled = true
                }
                else OffsetMax.textContent = newOffsetMaxVal
            }
            else OffsetMax.textContent = newOffsetMaxVal

            if (
                (+OffsetMax.textContent - +OffsetMin.textContent + 1) < +RowsPerPage.value &&
                +RowsPerPage.value <= DataGrid.NumRows
            ) {
                OffsetMax.textContent = +OffsetMin.textContent + +RowsPerPage.value - 1
            }

            DataGrid.NextPageBtn.disabled = disabled
            DataGrid.ReadData()
        })
    } // SetupNextPrevBtns()

    ResetRowsSelected() {
        const allCheckbox = this.DataGrid.querySelector('[data-checkbox-group-all]')
        if (+allCheckbox.getAttribute('data-checkbox-selected-count') > 0) allCheckbox.click()
    }

    /**
     * Determines if the element 'elem' is a descendant
     * of the element 'parent'
     * @param {HTMLElement} elem Descendant element
     * @param {HTMLElement} parent Parent element
     * @returns {-1|0|1} -1 Means not a descendant.
     * 0 Means the same as parent. 1 Means is a descendant
     */
    ElemIsDescendantOf(elem, parent) {
        if (elem === parent) return 0
        for (let curElem = elem.parentElement; curElem !== null; curElem = curElem.parentElement) {
            if (curElem === parent) return 1
        }
        return -1
    }
    
    GetFilters() {
        const rows = this.Toolbar.querySelectorAll('toolbar-panel-rui.filters row-rui[data-has-filter]')
        const filters = []

        for (let i = 0; i < rows.length; i++) {
            const filter = {
                operator: false,
                column: rows[i].children[2].children[0].value,
                operation: rows[i].children[3].children[0].value,
                filterValue: rows[i].children[4].children[0].value
            }

            if (i > 0) filter.operator = rows[i].children[1].children[0].value

            filters.push(filter)
        }

        return JSON.stringify(filters)
    }

    GetSorts() {
        const rows = this.Toolbar.querySelectorAll('toolbar-panel-rui.sorts row-rui[data-has-sort]')
        const sorts = []

        for (const row of rows) {
            sorts.push({
                order: row.children[0].children[0].value,
                column: row.children[1].getAttribute('data-column'),
                direction: row.children[2].children[0].value
            })
        }
        
        sorts.sort((a, b) => +a.order - +b.order)
        return JSON.stringify(sorts)
    }

    ReadData() {
        const data = new FormData()
        data.append('REQUEST_ACTION', 'READ')
        data.append('sorts', this.GetSorts())
        data.append('filters', this.GetFilters())
        data.append('limit', this.Pagination.querySelector('[data-rows-per-page-value]').value)
        data.append('offset', this.Pagination.querySelector('offset-min-rui').textContent - 1)

        fetch(this.CrudUrl, {
            method: 'POST',
            body: data
        })
        .then(resp => resp.json())
        .then(
            /**
             * @param {Object} entity
             * @param {Object[]} entity.rows
             * @param {Object[]} entity.rowIds
             * @param {Number} entity.numRows
             */
            entity => {
                this.Rows = entity.rows
                this.RowIDs = entity.rowIds

                if (this.NumRows !== entity.numRows) {
                    this.NumRows = entity.numRows
                    this.Pagination.querySelector('num-rows-rui').textContent = this.NumRows
                }
                if (entity.numRows === 0) {
                    this.Pagination.querySelector('offset-min-rui').textContent = 0
                    this.Pagination.querySelector('offset-max-rui').textContent = 0
                }
                if (entity.numRows <= +this.Pagination.querySelector('[data-rows-per-page-value]').value) {
                    this.NextPageBtn.disabled = true
                    this.Pagination.querySelector('offset-max-rui').textContent = entity.numRows
                }
                
                this.ResetRowsSelected()
                this.CreateRows()
                this.SizeColumns()
                this.HideColumns()
                this.SetupCheckboxes()
            }
        )
        .catch(e => console.error(e))
    }

    FilterReadData() {
        this.Pagination.querySelector('offset-min-rui').textContent = 1
        this.Pagination.querySelector('offset-max-rui').textContent = this.Pagination.querySelector('[data-rows-per-page-value]').value
        this.PrevPageBtn.disabled = true
        this.NextPageBtn.disabled = false
        this.ReadData()
    }
} // class{}