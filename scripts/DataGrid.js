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

/**
 * Filter
 * @typedef {Object} Filter
 * @property {false|'AND'|'OR'} operator The operator
 * @property {String} column The column
 * @property {String} operation The operation
 * @property {String} filterValue The filter value
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

    init = () => {
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

    CreateToolbar = () => {
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

    CreateColumnsPanelContainer = () => {
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
    
    // TODO: Fix Next Button, Columns that have 'selects'
    CreateFiltersPanelContainer = () => {
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
                                        if ( row.hasAttribute('data-has-query') ) {
                                            FiltersBtn.value = +FiltersBtn.value - 1

                                            if (+FiltersBtn.value > 0) Indicator.classList.remove('hide')
                                            else Indicator.classList.add('hide')
                                        }

                                        row.remove()
                                        SetOperatorVisibility()
                                        PanelContent.setAttribute('data-rows', numRows - 1)

                                        DataGrid.RetrieveData()
                                    }
                                })

                            DeleteRow.appendChild(Btn)

                            const opOptions = [
                                {
                                    value: 'AND',
                                    textContent: 'And'
                                },
                                {
                                    value: 'OR',
                                    textContent: 'Or',
                                }
                            ]
                            if (PanelContent.children.length > 0) {
                                const PrevOp = PanelContent.lastElementChild.children[1].children[0]
                                if (PrevOp.value === 'AND') opOptions[0].selected = ''
                                else if (PrevOp.value === 'OR') opOptions[1].selected = ''
                            }
                            const Operator = Select({
                                labelText: 'Operators',
                                attrs: { class: 'w8' },
                                evts: {
                                    change: function() {
                                        const Ops = PanelContent.querySelectorAll('[data-operators]')
                                        for (const Op of Ops) Op.children[0].value = this.value

                                        // When to call RetrieveData
                                        const row = this.parentElement.parentElement
                                        if ( row.hasAttribute('data-has-query') ) DataGrid.RetrieveData()
                                    }
                                },
                                options: opOptions
                            })
                            Operator.setAttribute('data-operators', '')
                            Operator.className = 'mr-_5 hidden'
                            
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
                                        if ( row.hasAttribute('data-has-query') ) DataGrid.RetrieveData()
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

                                        if (this.value === 'isEmpty' || this.value === 'isNotEmpty') {
                                            filterValue.parentElement.classList.add('invisible')
                                            filterValue.value = null

                                            // Row Element
                                            this.parentElement.parentElement.setAttribute('data-has-query', '')

                                            FiltersBtn.value = +FiltersBtn.value + 1
                                            DataGrid.RetrieveData()
                                        }
                                        else if (this.getAttribute('data-value') === 'isEmpty' || this.getAttribute('data-value') === 'isNotEmpty')
                                        {
                                            filterValue.parentElement.classList.remove('invisible')
                                            this.parentElement.parentElement.removeAttribute('data-has-query')

                                            FiltersBtn.value = +FiltersBtn.value - 1
                                            DataGrid.RetrieveData()
                                        }
                                        else if (filterValue.value) {
                                            DataGrid.RetrieveData()
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
                                            this.parentElement.parentElement.setAttribute('data-has-query', '')
                                            FiltersBtn.value = +FiltersBtn.value + 1
                                        }
                                        else {
                                            this.parentElement.parentElement.removeAttribute('data-has-query')
                                            FiltersBtn.value = +FiltersBtn.value - 1
                                        }

                                        if (+FiltersBtn.value > 0) Indicator.classList.remove('hide')
                                        else Indicator.classList.add('hide')

                                        DataGrid.RetrieveData()
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

    // TODO
    CreateSortsPanelContainer = () => {
        const SortsPanelContainer = document.createElement('toolbar-panel-container-rui')
            const SortsBtn = document.createElement('button')
            SortsBtn.type = 'button'
            SortsBtn.className = 'toolbar-btn'
            SortsBtn.innerHTML = `<i class="fas fa-sort"></i> Sorts`
        SortsPanelContainer.appendChild(SortsBtn)

        this.Toolbar.appendChild(SortsPanelContainer)
    }

    CreateMain = () => {
        this.Main = document.createElement('main-rui')
        this.CreateHeadingsContainer()
        this.CreateRowsContainer()
        this.DataGrid.appendChild(this.Main)
    }

    CreateHeadingsContainer = () => {
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

    CreateRowsContainer = () => {
        this.RowsContainer = document.createElement('rows-container-rui')
        this.CreateRows()
        this.Main.appendChild(this.RowsContainer)

        this.RowsContainer.addEventListener('scroll', this.ScrollHeadings)
    }

    CreateRows = () => {
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

    CreateFooter = () => {
        this.Footer = document.createElement('footer-rui')
        
            const NumSelectedRows = document.createElement('num-selected-rows-rui')
            NumSelectedRows.textContent = '0 rows selected'

        this.Footer.appendChild(NumSelectedRows)
        this.CreatePagination()
        this.DataGrid.appendChild(this.Footer)
    }

    CreatePagination = () => {
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

    ScrollHeadings = () => {
        this.HeadingsContainer.children[0].style.transform = `translateX(-${this.RowsContainer.scrollLeft}px)`
    }

    SizeColumns = () => {
        const HCols = this.HeadingsContainer.querySelectorAll('hcol-rui')
        const Rows = this.RowsContainer.querySelectorAll('row-rui')

        for (const row of Rows) {
            for (let i = 1; i < row.children.length; i++) {
                row.children[i].style.minWidth = HCols[i].style.minWidth
                row.children[i].style.maxWidth = HCols[i].style.maxWidth
            }
        }
    }

    HideColumns = () => {
        const HCols = this.HeadingsContainer.querySelectorAll('hcol-rui.hide')

        for (const hcol of HCols) {
            const i = +hcol.children[1].getAttribute('data-colindex')
            const Cols = this.RowsContainer.querySelectorAll(`col-rui[data-colindex="${i}"]`)
            for (const col of Cols) col.classList.add('hide')
        }
    }

    SetupAllCheckbox = () => {
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

    SetupCheckboxes = () => {
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

    SetupResizingColumns = () => {
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

    SetupNextPrevBtns = () => {
        const RowsPerPage = this.DataGrid.querySelector('[data-rows-per-page-value]')
        const OffsetMin = this.DataGrid.querySelector('offset-min-rui')
        const OffsetMax = this.DataGrid.querySelector('offset-max-rui')
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

    ResetRowsSelected = () => {
        const allCheckbox = this.DataGrid.querySelector('[data-checkbox-group-all]')
        if (+allCheckbox.getAttribute('data-checkbox-selected-count') > 0) allCheckbox.click()
    }

    /**
     * Determines if the element 'elem' is a descendant of the element 'parent'
     * @param {HTMLElement} elem Descendant element
     * @param {HTMLElement} parent Parent element
     * @returns {-1|0|1} -1 Means not a descendant. 0 Means the same as parent. 1 Means is a descendant
     */
    ElemIsDescendantOf = (elem, parent) => {
        if (elem === parent) return 0
        for (let curElem = elem.parentElement; curElem !== null; curElem = curElem.parentElement) {
            if (curElem === parent) return 1
        }
        return -1
    }

    /**
     * The object version of Array.filter()
     * @param {Object} obj Object to filter
     * @param {Function} callback Function to test elements
     * @returns {Object} Filtered object
     */
    ObjectFilter = (obj, callback) => {
        return Object.fromEntries(
            Object.entries(obj).filter( ([key, val]) => callback(key, val) )
        )
    }

    RandomString = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let str = ''
        const numChars = Math.floor(Math.random() * (12 - 3 + 1) + 3)

        for (let i = 0; i < numChars; i++) str += chars[ Math.floor(Math.random() * 26) ]

        return str
    }

    GetFilters = () => {
        const Rows = this.Toolbar.querySelectorAll('toolbar-panel-rui.filters row-rui[data-has-query]')
        const filters = []

        for (let i = 0; i < Rows.length; i++) {
            const filter = {
                operator: false,
                column: Rows[i].children[2].children[0].value,
                operation: Rows[i].children[3].children[0].value,
                filterValue: Rows[i].children[4].children[0].value
            }

            if (i > 0) filter.operator = Rows[i].children[1].children[0].value

            filters.push(filter)
        }

        return filters
    }

    RetrieveData = () => {
        const data = {
            filters: this.GetFilters(),
            limit: +this.DataGrid.querySelector('[data-rows-per-page-value]').value,
            offset: +this.DataGrid.querySelector('offset-min-rui').textContent - 1
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
                this.NumRows = entity.numRows
                
                this.ResetRowsSelected()
                this.CreateRows()
                this.SizeColumns()
                this.HideColumns()
                this.SetupCheckboxes()

                this.Pagination.querySelector('num-rows-rui').textContent = this.NumRows
            }
        )
        .catch(e => console.error(e))
    }
} // class{}