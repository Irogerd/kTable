"use strict";

var kokinTable = (function () {
    var _data = [];
    var _template = [];
    var _checkedCBX = 0;
    var _tableElement, _managePanel;
    var _itemsPerPage = 0;

    /**
     * Регистрирует событие для динамически созданных элементов заданного класса
     * @param event Тип события
     * @param classname Имя класса
     * @param callback РЕАКЦИЯ
     * @param args Параметры РЕАКЦИИ
     */
    var addEventListenerToClass = function (event, classname, callback, params) {
        classname = classname.substr(1);
        function hasClass(elem, className) {
            return elem.className.split(' ').indexOf(className) > -1;
        }

        document.addEventListener(event, function (e) {
            if (hasClass(e.target, classname)) {
                callback.call(e.target, params);
            }
        }, false);
    };

    var renderControlPanel = function () {
        var template = "";
        var createCheckBoxes = function (a) {
            template += "<p>" +
                "<label><input type='checkbox' class='cbx-table' id='" + a.id + "' value='" + a.name + "'>"
                + a.title + "</label></p>";
        };
        _.forEach(checkboxes, createCheckBoxes);
        _managePanel.innerHTML = template;
    };

    var initEvents = function () {
        addEventListenerToClass('change', '.cbx-table-delete', function () {
            var id = $(this).attr('id').split('-')[1], index;
            index = _.findIndex(data, function (item) {
                return item.id == id;
            });
            data[index].hidden = +this.checked;
        });
        addEventListenerToClass('click', '.sortAZ', sortData, false);
        addEventListenerToClass('click', '.sortZA', sortData, true);
    };


    /**
     * Сортирует массив с данными
     * @param by Ключ, по которому производится сортировка
     * @param reverse boolean Задает порядок сортировки
     */
    var sortData = function (reverse) {
        var key = this.id.split("-");
        _data = _.sortBy(_data, key[1]);
        if (reverse)
            _data.reverse();
        renderTable();
    };

    /**
     *
     */
    var redrawTableHeader = function () {
        var tableContent = "";
        var elements = document.querySelectorAll(".cbx-table");
        Array.prototype.forEach.call(elements, function (el, index) {
            _template[el.id]['isChecked'] = 0;
            if (el.checked) { //возводим флаги у выбранных чекбоксов
                _checkedCBX++;
                _template[el.id]['isChecked'] = 1;
                var buttonSortAZ = "<button class = 'sortAZ' id='SortAZ-" + _template[el.id]['assignedWith'] + "'>SortAZ</button>";
                var buttonSortZA = "<button class = 'sortZA' id='SortZA-" + _template[el.id]['assignedWith'] + "'>SortZA</button>";
                tableContent += "<td>" + _template[el.id]['title'] + buttonSortAZ + buttonSortZA + "</td>";
            }
        });
        tableContent += "<td>&nbsp;</td>";
        _tableElement.innerHTML += "<thead><tr>" + tableContent + "</tr></thead>";
    };

    /**
     *
     */
    var redrawTableBody = function (hideDeleted) {
        var tableContent = "";
        /**
         * Callback, вызываемый для массива данных.
         * @param dElem Элемент из массива _data
         */
        var fillRow = function (dElem) {
            if (!hideDeleted) dElem.hidden = 0;
            if (dElem.hidden == 0) {
                tableContent += "<tr id='row-" + dElem['id'] + "'>";
                // cElem - Элемент из массива _template
                _.forEach(_template, function (cElem) {
                    if (cElem['isChecked'] == 1)
                        tableContent += "<td>" + dElem[cElem['assignedWith']] + "</td>";
                });
                var trCBX = "<label><input type='checkbox' class='cbx-table-delete' id='cbxDel-" + dElem['id'] + "'></label>"
                tableContent += "<td>" + trCBX + "</td>";
                tableContent += "</tr>";
            }
        };
        _.forEach(_data, fillRow);
        _tableElement.innerHTML += "<tbody>" + tableContent + "</tbody>";
    };

    /**
     *
     */
    var renderTable = function (hideDeleted) {
        _tableElement.innerHTML = "";
        _checkedCBX = 0;
        redrawTableHeader();
        if (_checkedCBX == 0)
            return (_tableElement.style.display = 'none');
        else
            _tableElement.style.display = 'table';
        redrawTableBody(hideDeleted);
        _tableElement.innerHTML += "<tfoot><tr><td colspan=" + (_checkedCBX + 1) + "></td></tr></tfoot>";
        renderPagination(document.getElementById('table'), _itemsPerPage);
    };

    // Область видимости, доступная пользователю
    return {
        /**
         * Отрисовывает данные в таблице с ID == tableID и элементы управления в контейнере с ID == manageID
         * В случае, если контейнеров с такими ID не существует, выведет сообщение об ошибке в консоль
         * @param tableID
         * @param manageDivID
         * @exception UndefinedTableException В случае, когда таблица с ID == tableID не существует
         * @exception UndefinedManageContainerException В случае, когда контейнер с ID == manageID не существует
         * @exception NoDataSourceException В случае, когда не задан источник данных
         */
        init: function (tableID, manageDivID) {
            _tableElement = document.getElementById(tableID);
            _managePanel = document.getElementById(manageDivID);
            renderControlPanel();
            initEvents();
        },
        /**
         * TODO: Красиво сформулировать, зачем нужен checkboxes из data.js
         */
        setDataTemplate: function (template) {
            _template = template;
        },

        buildTable: renderTable,
        /**
         * Устанавливает источник данных для таблицы для последующего отображения
         * @param data Массив JavaScript, в котором содержатся данные
         */
        setData: function (data) {
            _data = data;
        },

        /**
         * Устанавливает количество элементов, выводимых на странице таблицы
         * @param count
         * @exception PagesCountError
         */
        setItemsPerPage: function (count) {
            if (count > 0)
                _itemsPerPage = count;
            else
                console.error("PagesCountError: Количество элементов на странице должно быть больше нуля!");
        }
    };
})();