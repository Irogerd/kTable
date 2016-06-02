"use strict";

// TODO: написать README.md
// TODO: почитать: MVC, bootstrap
// TODO: протестировать во всех актуальных браузерах
/**
 * Введение: что заставило написать этот контрол
 * В основной части диплома: аналитика. Сравнение с аналогами, плюсы и минусы
 * Заключение: что реализовано, какие плюсы
 */

var kTable = (function () {
    var _data = [];
    var _template = [];
    var _templateLength = 0;
    var _checkedCBX = 0;
    var _isCbxPanel = false;
    var _tableElement, _managePanel;
    var _itemsPerPage = 0;
    var _customFunc = [];

    /**
     * Регистрирует событие для динамически созданных элементов заданного класса
     * @param event Тип события
     * @param classname Имя класса
     * @param callback действие на событие
     * @param args Параметры действия на событие
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
        var createCheckBoxes = function (a, key) {
            template += "<p>" +
                "<label><input type='checkbox' checked  class='cbx-table' id='" + key + "' value='" + a.name + "'>"
                + a.title + "</label></p>";
        };

        _.forEach(_template, createCheckBoxes);
        _managePanel.innerHTML = template;

    };

    var initEvents = function () {
        addEventListenerToClass('change', '.cbx-table-delete', function () {
            var id = this.getAttribute('id').split('-')[1];
            for (var i = 0; i < _data.length; i++) {
                if (_data[i].id == id) {
                    _data[i].hidden = +this.checked;
                    i = _data.length;
                    if (this.checked)
                        document.getElementById("row-" + id).className = "highlighted";
                    else
                        document.getElementById("row-" + id).className = "nohighlighted";
                }
            }
        });

        addEventListenerToClass('click', '.sortAZ', sortData, false);
        addEventListenerToClass('click', '.sortZA', sortData, true);
        addEventListenerToClass('click', '.checkAll', check, true);
        addEventListenerToClass('click', '.uncheckAll', check, false);
        addEventListenerToClass('change', '.cbx-table', remakeTemplate);
    };


    /**
     * Функции ForEach
     */
    var ArrayProto = Array.prototype, breaker = {};
    var _ = function (obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };
    var nativeForEach = ArrayProto.forEach;
    var nativeKeys = Object.keys;
    // Is a given variable an object?
    _.isObject = function (obj) {
        return obj === Object(obj);
    };
    _.has = function (obj, key) {
        return hasOwnProperty.call(obj, key);
    };
    _.keys = function (obj) {
        if (!_.isObject(obj)) return [];
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        for (var key in obj) if (_.has(obj, key)) keys.push(key);
        return keys;
    };
    var each = _.each = _.forEach = function (obj, iterator, context) {
        if (obj == null) return obj;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
            }
        }
        return obj;
    };

    /**
     * Функции SortBy
     */
    _.property = function (key) {
        return function (obj) {
            return obj[key];
        };
    };
    _.identity = function (value) {
        return value;
    };
    _.isFunction = function (obj) {
        return typeof obj === 'function';
    };
    // An internal function to generate lookup iterators.
    var lookupIterator = function (value) {
        if (value == null) return _.identity;
        if (_.isFunction(value)) return value;
        return _.property(value);
    };
    var nativeMap = ArrayProto.map;
    _.map = _.collect = function (obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        each(obj, function (value, index, list) {
            results.push(iterator.call(context, value, index, list));
        });
        return results;
    };
    _.pluck = function (obj, key) {
        return _.map(obj, _.property(key));
    };
    // Sort the object's values by a criterion produced by an iterator.
    _.sortBy = function (obj, iterator, context) {
        iterator = lookupIterator(iterator);
        return _.pluck(_.map(obj, function (value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iterator.call(context, value, index, list)
            };
        }).sort(function (left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === void 0) return 1;
                if (a < b || b === void 0) return -1;
            }
            return left.index - right.index;
        }), 'value');
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
     * Отмечает все чекбоксы
     */
    var check = function (flag) {
        var elements = document.querySelectorAll('.cbx-table-delete');
        Array.prototype.forEach.call(elements, function (el) {
            el.checked = flag;
            var id = el.getAttribute('id').split('-')[1];
            for (var i = 0; i < _data.length; i++) {
                if (_data[i].id == id) {
                    _data[i].hidden = +flag;
                    i = _data.length;
                    if (flag)
                        document.getElementById("row-" + id).className = "highlighted";
                    else
                        document.getElementById("row-" + id).className = "nohighlighted";

                }
            }
        });
    };

    /**
     * Изменение массива-шаблона в зависимости от взведенных чекбоксов
     */
    var remakeTemplate = function () {
        _isCbxPanel = true;
        var elements = document.querySelectorAll(".cbx-table");
        _checkedCBX = 0;
        Array.prototype.forEach.call(elements, function (el) {
            _template[el.id]['isChecked'] = 0;
            if (el.checked) {
                _checkedCBX++;
                _template[el.id]['isChecked'] = 1;
            }
        });
    };

    /**
     * Отрисовка шапки таблицы
     */
    var redrawTableHeader = function () {
        var tableContent = "";
        if (!_isCbxPanel)
            _checkedCBX = _templateLength;
        _.forEach(_template, function (el) {
            if (el['isChecked'] == 1) {
                var buttonSortAZ = "<button class = 'sortAZ' id='SortAZ-" + el['assignedWith'] + "'>A->Z</button>";
                var buttonSortZA = "<button class = 'sortZA' id='SortZA-" + el['assignedWith'] + "'>Z->A</button>";
                tableContent += "<td class='tableHead" + el['width'] + "'>" + el['title'] + buttonSortAZ + buttonSortZA + "</td>";
            }
        });
        tableContent += "<td class='tableHead'>&nbsp;</td>";
        if (_customFunc.length > 0)
            tableContent += "<td class='tableHead'>&nbsp;</td>"
        _tableElement.innerHTML += "<thead><tr>" + tableContent + "</tr></thead>";
    };

    /**
     * Отрисовывает тело таблицы
     * @param hideDeleted boolean скрыть отмеченные удаленными элементы
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
                        tableContent += "<td class='" + cElem['assignedWith'] + "'>" + dElem[cElem['assignedWith']] + "</td>";
                });
                var trCBX = "<label><input type='checkbox' class='cbx-table-delete' id='cbxDel-" + dElem['id'] + "'></label>";

                var customButton = "";
                for (var i = 0; i < _customFunc.length; i++) {
                    var name = _customFunc[i]['name'];
                    customButton += "<button class = 'customButton' onclick='(" + _customFunc[i]['func'] + ")(" + dElem['id'] + ")' id='customButton-" + i + "'>" + name + "</button>";
                }

                if (customButton != "")
                    tableContent += "<td>" + customButton + "</td>";
                tableContent += "<td>" + trCBX + "</td>" + "</tr>";
            }
        };
        _.forEach(_data, fillRow);
        _tableElement.innerHTML += "<tbody>" + tableContent + "</tbody>";
    };

    /**
     * Создание всей таблицы
     */
    var renderTable = function (hideDeleted) {
        _tableElement.innerHTML = "";
        //_checkedCBX = 0;
        redrawTableHeader();
        if (_checkedCBX == 0)
            return (_tableElement.style.display = 'none');
        else
            _tableElement.style.display = 'table';
        redrawTableBody(hideDeleted);
        _tableElement.innerHTML += "<tfoot class='tFoot'><tr><td colspan=" + (_checkedCBX + 2) + "></td></tr></tfoot>";
        renderPagination(document.getElementById('table'), _itemsPerPage);
    };

    /**
     * Изменение данных в строке таблицы
     * @param id номер строки
     * @param field поле (столбец) таблицы, в котором нужно менять значение
     * @param newValue новое значение
     */
    var changeTableRow = function (id, field, newValue) {
        var tableRow = document.getElementById("row-" + id);
        var elements = tableRow.getElementsByClassName(field);
        if (elements.length != 1)
            return;
        elements[0].innerHTML = newValue;

    };

    // Область видимости, доступная пользователю
    return {
        /**
         * Отрисовывает данные в таблице с ID == tableID и элементы управления в контейнере с ID == manageDivID
         * В случае, если контейнеров с такими ID не существует, выведет сообщение об ошибке в консоль
         * init - в случае, если контейнер с чекбоксами для столбцов не существует
         * initWithManage - если существует
         * @param tableID
         * @param manageDivID
         * @exception UndefinedTableException В случае, когда таблица с ID == tableID не существует
         * @exception UndefinedManageContainerException В случае, когда контейнер с ID == manageID не существует
         * @exception NoDataSourceException В случае, когда не задан источник данных
         */
        init: function (tableID) {
            _tableElement = document.getElementById(tableID);
            if (_tableElement === null)
                console.error("UndefinedTableException");
            if (_data === [])
                console.error("NoDataSourceException");
            initEvents();

        },

        initWithManage: function (tableID, manageDivID) {
            _tableElement = document.getElementById(tableID);
            _managePanel = document.getElementById(manageDivID);
            if (_tableElement === null)
                console.error("UndefinedTableException");
            if (_managePanel === null)
                console.error("UndefinedManageContainerException");
            if (_data === [])
                console.error("NoDataSourceException");
            renderControlPanel();
            initEvents();
        },
        /**
         * Задает шаблон данных: столбцы таблицы в виде ассоциативного массива
         *  {
         *      item1:     {    title: заголовок столбца (название)
         *                      assignedWith: с каким полем из массива с данными связан
         *                      width: ширина столбца (маленький=small, средний=medium, большой=large)
         *                 },
         *      item2: {title, assignedWith, width },
         *      ...
         *  }
         */

        setDataTemplate: function (template) {
            _template = template;
            _.forEach(_template, function (el) {
                _templateLength++;
                el['isChecked'] = 1;
            });
        },

        buildTable: renderTable,
        /**
         * Устанавливает источник данных для таблицы для последующего отображения
         * @param data Массив JavaScript, в котором содержатся данные
         */
        setData: function (data) {
            _data = data;
            for (var i = 0; i < _data.length; i++) {
                _data[i]["hidden"] = 0;
            }
        },

        changeRow: function (id, field, newValue) {
            _data[id][field] = newValue;
            changeTableRow(id, field, newValue);
        },
        /**
         * Устанавливает массив функций для кастомных кнопок
         * @param cf масив объектов {nameOfButton, function(){}}
         */
        setCustomFunctions: function (cf) {
            _customFunc = cf;
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