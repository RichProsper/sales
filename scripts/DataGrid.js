import Checkbox from '../vendors/rui/rui-checkbox.min.js'
import Switch from '../vendors/rui/rui-switch.min.js'
import Input from '../vendors/rui/rui-input.min.js'
import Select from '../vendors/rui/rui-select.min.js'

/**
 * Grid Data
 * @typedef {Object} GridData
 * @property {String[]} columns The columns
 * @property {Object[]} rows The rows
 * @property {Number} numRows The number of rows
 * @property {String} checkboxId The checkbox ID
 * @property {String} phpPath The path of the php script that retrieves the data
 */

export default class {
    /**
     * @param {String} gridId The Grid Id
     * @param {GridData} data The data to fill the grid
     */
    constructor(gridId, data) {
        this.DataGridContainer = document.querySelector(`[data-grid-id="${gridId}"]`)
        this.Columns = data.columns
        this.Rows = data.rows
        this.NumRows = data.numRows
        this.CheckboxId = data.checkboxId
        this.PhpPath = data.phpPath
        this.init()
    }

    init() {
        this.RPPVs = [5, 10, 25, 50, 100] //RowsPerPageValues
        this.RPPDV = 25 //RowsPerPageDefaultValue
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
        this.Timer = null

        this.DataGrid = document.createElement('datagrid-rui')
        this.CreateToolbar()
        this.CreateMain()
        this.CreateFooter()
        this.DataGridContainer.appendChild(this.DataGrid)

        this.SizeColumns()
        this.SetupAllCheckbox()
        this.SetupCheckboxes()
        this.SetupResizingColumns()
        this.SetupNextPrevBtns()
    }

    CreateToolbar() {
        this.Toolbar = document.createElement('toolbar-rui')

            const NewBtn = document.createElement('button')
            NewBtn.type = 'button'
            NewBtn.className = 'toolbar-btn new'
            NewBtn.innerHTML = `<i class="fas fa-plus"></i> New`

            const DelBtn = document.createElement('button')
            DelBtn.type = 'button'
            DelBtn.className = 'toolbar-btn del'
            DelBtn.innerHTML = `<i class="far fa-trash-alt"></i> Delete`

        this.CreateColumnsPanelContainer()
        this.CreateFiltersPanelContainer()
        this.CreateSortsPanelContainer()
        this.Toolbar.appendChild(NewBtn)
        this.Toolbar.appendChild(DelBtn)

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
                                const HCol = Datagrid.DataGrid.querySelectorAll('hcol-rui')[i + 1]
                                const Cols = Datagrid.DataGrid.querySelectorAll(`col-rui[data-colindex="${i}"]`)
                                
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

                    const SetOperatorVisibility = () => {
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

                    const CreateFilterRow = () => {
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
                                        SetOperatorVisibility()
                                        PanelContent.setAttribute('data-rows', numRows - 1)

                                        DataGrid.FilterRetrieveData()
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

                                        // When to call FilterRetrieveData
                                        const row = this.parentElement.parentElement
                                        if ( row.hasAttribute('data-has-filter') ) DataGrid.FilterRetrieveData()
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
                                        if ( row.hasAttribute('data-has-filter') ) DataGrid.FilterRetrieveData()
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
                                            
                                            DataGrid.FilterRetrieveData()
                                        }
                                        else if (this.getAttribute('data-value') === 'isEmpty' || this.getAttribute('data-value') === 'isNotEmpty')
                                        {
                                            filterValue.parentElement.classList.remove('invisible')
                                            row.removeAttribute('data-has-filter')

                                            FiltersBtn.value = +FiltersBtn.value - 1
                                            DataGrid.FilterRetrieveData()
                                        }
                                        else if (filterValue.value) {
                                            DataGrid.FilterRetrieveData()
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
                        Row.appendChild( Input({
                            attrs: {
                                class: 'w18',
                                placeholder: 'Filter Value'
                            },
                            evts: {
                                input: function() {
                                    clearTimeout(DataGrid.Timer)
                                    DataGrid.Timer = setTimeout(() => {
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

                                        DataGrid.FilterRetrieveData()
                                    }, 1000)
                                }
                            }
                        }) )

                        PanelContent.appendChild(Row)

                        const numRows = +PanelContent.getAttribute('data-rows')
                        PanelContent.setAttribute('data-rows', numRows + 1)
                    } // CreateFilterRow()
                    CreateFilterRow()

                const PanelFooter = document.createElement('panel-footer-rui')

                    const AddFilterBtn = document.createElement('button')
                    AddFilterBtn.type = 'button'
                    AddFilterBtn.className = 'panel-btn'
                    AddFilterBtn.innerHTML = `<i class="fas fa-plus"></i> ADD FILTER`
                    AddFilterBtn.addEventListener('click', () => {
                        CreateFilterRow()
                        SetOperatorVisibility()
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
                                    DataGrid.RetrieveData()
                                }
                            },
                            options: orderOptions
                        })
                        Order.classList.add('mr-_5')

                        const Column =  document.createElement('span')
                        Column.textContent = Object.keys(this.Columns)[i]
                        Column.title = Object.keys(this.Columns)[i]
                        Column.setAttribute('data-column', '')
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
                                        if ( row.hasAttribute('data-has-sort') ) return

                                        row.setAttribute('data-has-sort', '')
                                        order.disabled = false

                                        SortsBtn.value = +SortsBtn.value + 1
                                        if (+SortsBtn.value > 0) Indicator.classList.remove('hide')
                                        else Indicator.classList.add('hide')

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

                                    DataGrid.RetrieveData()
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

                        DataGrid.RetrieveData()
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
    }

    CreateMain() {
        this.Main = document.createElement('main-rui')
        this.CreateHeadingsContainer()
        this.CreateRowsContainer()
        this.DataGrid.appendChild(this.Main)
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
                    HCol.style.minWidth = '12rem'
                    HCol.style.maxWidth = '12rem'

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
        this.CreateRows()
        this.Main.appendChild(this.RowsContainer)

        this.RowsContainer.addEventListener('scroll', () => {
            this.HeadingsContainer.children[0].style.transform = `translateX(-${this.RowsContainer.scrollLeft}px)`
        })
    }

    CreateRows() {
        this.RowsContainer.innerHTML = null

        for (let i = 0; i < this.Rows.length; i++) {
            const Row = document.createElement('row-rui')
            Row.setAttribute('data-rowindex', i)

                const Col = document.createElement('col-rui')
                Col.className = 'select-column'
                Col.appendChild( Checkbox({
                    attrs: {
                        'data-checkbox-group-single': ''
                    }
                }) )
            Row.appendChild(Col)

                let j = 0
                for (let col in this.Rows[i]) {
                    const Col = document.createElement('col-rui')
                    Col.setAttribute('data-colindex', j)
                    Col.textContent = this.Rows[i][col]
                    Row.appendChild(Col)
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

                            DataGrid.RetrieveData()
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
            const Cols = this.RowsContainer.querySelectorAll(`col-rui[data-colindex="${i}"]`)
            for (const col of Cols) col.classList.add('hide')
        }
    }

    SetupAllCheckbox() {
        const allCheckbox = this.DataGrid.querySelector('[data-checkbox-group-all]')
        const Datagrid = this

        allCheckbox.addEventListener('change', function() {
            const checkboxes = Datagrid.DataGrid.querySelectorAll('[data-checkbox-group-single]')

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
        const Headings = this.DataGrid.querySelector('headings-rui')
        const Resizables = Headings.querySelectorAll('resizable-rui')

        // *** Resizing Columns ***
        const curPos = {
            x: 0,
            colIndex: 0,
            minWidth: 5, //5rem
            minLeft: 0
        }
        const getDenom = () => {
            if (window.innerWidth >= 2700) return 15
            if (window.innerWidth >= 1800) return 12.5
            if (window.innerWidth >= 900 ) return 10
            return 7.5
        }
        /**
         * @param {MouseEvent} e 
         */
        const resizeCols = e => {
            const HCol = Headings.querySelectorAll('hcol-rui')[curPos.colIndex + 1]
            const HColWidth = HCol.getBoundingClientRect().width

            // Stops resizing when cursors moves to the left of the resizable icon
            if (( HColWidth / getDenom() ) === curPos.minWidth) {
                curPos.minLeft = curPos.minLeft < 0 ? e.clientX : curPos.minLeft
            }
            if (e.clientX < curPos.minLeft) return

            const diff = e.clientX - curPos.x
            curPos.x = e.clientX
            const newWidth = (HColWidth + diff) / getDenom()
            
            if (newWidth < curPos.minWidth) return

            HCol.style.minWidth = `${newWidth}rem`
            HCol.style.maxWidth = `${newWidth}rem`

            const Cols = this.RowsContainer.querySelectorAll(`col-rui[data-colindex="${curPos.colIndex}"]`)
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
            DataGrid.RetrieveData()
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
            DataGrid.RetrieveData()
        })
    } // SetupNextPrevBtns()

    ResetRowsSelected() {
        const allCheckbox = this.DataGrid.querySelector('[data-checkbox-group-all]')
        if (+allCheckbox.getAttribute('data-checkbox-selected-count') > 0) allCheckbox.click()
    }

    /**
     * Determines if the element 'elem' is a descendant of the element 'parent'
     * @param {HTMLElement} elem Descendant element
     * @param {HTMLElement} parent Parent element
     * @returns {-1|0|1} -1 Means not a descendant. 0 Means the same as parent. 1 Means is a descendant
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

        return filters
    }

    // TODO
    GetSorts() {
        const rows = this.Toolbar.querySelectorAll('toolbar-panel-rui.sorts row-rui[data-has-sort]')
        const sorts = []

        for (const row of rows) {
            sorts.push({
                order: row.children[0].children[0].value,
                column: row.children[1].title,
                direction: row.children[2].children[0].value
            })
        }
        
        sorts.sort((a, b) => +a.order - +b.order)
        return sorts
    }

    RetrieveData() {
        const data = {
            sorts: this.GetSorts(),
            filters: this.GetFilters(),
            limit: +this.Pagination.querySelector('[data-rows-per-page-value]').value,
            offset: +this.Pagination.querySelector('offset-min-rui').textContent - 1
        }

        fetch(this.PhpPath, {
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(resp => resp.json())
        .then(
            /**
             * @param {Object} entity
             * @param {Object[]} entity.rows
             * @param {Number} entity.numRows
             */
            entity => {
                this.Rows = entity.rows

                if (this.NumRows !== entity.numRows) {
                    this.NumRows = entity.numRows
                    this.Pagination.querySelector('num-rows-rui').textContent = this.NumRows

                    if (entity.numRows === 0) {
                        this.Pagination.querySelector('offset-min-rui').textContent = 0
                        this.Pagination.querySelector('offset-max-rui').textContent = 0
                    }
                    if (entity.numRows <= +this.Pagination.querySelector('[data-rows-per-page-value]').value) {
                        this.NextPageBtn.disabled = true
                        this.Pagination.querySelector('offset-max-rui').textContent = entity.numRows
                    }
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

    FilterRetrieveData() {
        this.Pagination.querySelector('offset-min-rui').textContent = 1
        this.Pagination.querySelector('offset-max-rui').textContent = this.Pagination.querySelector('[data-rows-per-page-value]').value
        this.PrevPageBtn.disabled = true
        this.NextPageBtn.disabled = false
        this.RetrieveData()
    }
} // class{}