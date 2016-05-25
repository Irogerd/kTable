var renderPagination = (function (GLOB) {

    return function (HTMLTable, entryPerPage) {
        var table = HTMLTable,
            tBody = table.tBodies[0],
            pConfig = {
                toStart: "В начало",
                toPrev: "[[",
                toNext: "]]",
                toEnd: "В конец",
                linkPerPage: entryPerPage,
                linkTag: "span",
                template: "<span>Page: %p from %c (rows %r)</span><span>%n</span>",
                onAfterInit: undefined,
                onNavClick: undefined
            },
        // Контейнер в футере таблицы для постранички:
            linksContainer = table.tFoot.rows[0].cells[0],
        // текущая "страница"
            currentPage = 0,
        // Подмножество ссылок постранички:
            linksSet,
        // Общее кол-во ссылок:
            linksCnt,
        // Ссылок на "странице":
            offset,
        // ссылки на строки таблицы:
            trRefs;

        /**
         * "Снять" копию HTMLCollection в виде массива (конвертировать)
         * т.к. [].slice.call(HTMLCollection) в IE не пашет, то приходится изгаляться.
         * @param {HTMLCollection} rows
         * @returns {Array}
         */
        function copyRows(rows) {
            var copied = [],
                i;
            for (i = 0; i < rows.length; i += 1) {
                copied.push(rows.item(i));
            }
            return copied;
        }

        /**
         * Отобразить подмножество со ссылками
         * @param {Number} curPage - номер текущей страницы
         */
        function renderLinks(curPage) {
            // Определяем какому подмножеству принадлежит текущая страница:
            var curSetKey = Math.floor(curPage / pConfig.linkPerPage),
                template = pConfig.template,
                pagerHTML = "<" + pConfig.linkTag + " id=\"0\">" + (pConfig.toStart) + "</" + pConfig.linkTag + ">",
                setKey = 0,
                i;
            // Если мы имеем дело с первой страицей кнопку "Предыдущий" не показываем:
            if (curSetKey > 0) {
                pagerHTML += "<" + pConfig.linkTag + " id=\"" + (linksSet[curSetKey][0] - 1) + "\">" + (pConfig.toPrev) + "</" + pConfig.linkTag + ">";
            }
            for (i = 0; i < linksSet[curSetKey].length; i += 1) {
                setKey = linksSet[curSetKey][i];
                pagerHTML += "<" + pConfig.linkTag + " id=\"" + setKey + "\"" + (setKey === curPage ? " class=\"current\"" : "") + ">" + (setKey + 1) + "</" + pConfig.linkTag + ">";
            }
            // Если мы имеем дело с последней страицей кнопку "Следующий" не показываем:
            if (curSetKey < linksSet.length - 1) {
                pagerHTML += "<" + pConfig.linkTag + " id=\"" + (linksSet[curSetKey + 1][0]) + "\">" + (pConfig.toNext) + "</" + pConfig.linkTag + ">";
            }
            // Ссылка "в конец":
            pagerHTML += "<" + pConfig.linkTag + " id=\"" + (linksCnt - 1) + "\">" + (pConfig.toEnd) + "</" + pConfig.linkTag + ">";
            // Обрабатываем шаблон и подменяем весь html-за один раз:
            linksContainer.innerHTML = template.replace(/%n/g, pagerHTML).
            replace(/%p/g, String(curPage + 1)).
            replace(/%r/g, String(trRefs.length)).
            replace(/%c/g, linksCnt);
        }

        /**
         * Отобразить таблицу в заданном состоянии.
         * @param {Number} start - номер начальной строки
         * @param {Number} offset - кол-во отображаемых строк
         */
        function renderTableState(start, offset) {
            var startRow = start * offset,
                endRow = Math.min(trRefs.length, startRow + offset),
                i;
            // Очищаем tBody от потомков (tBody.innerHTML - не сработает в IE)
            while (tBody.firstChild) {
                tBody.removeChild(tBody.firstChild);
            }
            for (i = startRow; i < endRow; i += 1) {
                tBody.appendChild(trRefs[i]);
            }
            renderLinks(currentPage);
        }

        /**
         * Инициализация подмножестве ссылок
         * @param {Number} all - Общее кол-во ссылок
         * @param {Number} offset - кол-во ссылок, отображаемых на странице
         * @returns {Array}
         */
        function setupPager(all, offset) {
            /* Здесь мы создаем массив подмножеств ссылок:
             * [ [0,1,2,3], [4,5,6,7], ... [..., all - 1] ]
             * каждый подмассив (подмножество) имеет длину = offset
             * Далее в renderLinks() будем по номеру "страницы" определять в каком
             * подмножестве она находится:
             * Math.floor(start / offset) и будем просто
             * выводить на печать нужный чанк.
             */
            var linksSet = [],
                key,
                i;
            for (i = 0; i < all; i += 1) {
                key = Math.floor(i / offset);
                if (linksSet[key] === undefined) {
                    linksSet[key] = [];
                }
                linksSet[key].push(i);
            }
            return linksSet;
        }

        // Делегируем обработчик "кликов"
        linksContainer.onclick = function (e) {
            var event = e || GLOB.event,
                target = event.target || event.srcElement,
                start = 0;
            // Фильтруем "клики" только по элементам пагинатора
            if (target.tagName.toUpperCase() === pConfig.linkTag.toUpperCase() && isNaN(parseInt(target.id, 10)) === false) {
                start = parseInt(target.id, 10);
                // Если callback-ф-ция есть и она вернула true и кликнули не по текущей странице
                if ((pConfig.onNavClick && !pConfig.onNavClick(start)) ^ start !== currentPage) {
                    currentPage = start;
                    renderTableState(start, entryPerPage);
                }
            }
        };
        offset = pConfig.linkPerPage;
        trRefs = copyRows(tBody.children);

        linksCnt = Math.ceil(trRefs.length / entryPerPage);
        // Строим массив подмножеств сылок для постранички
        linksSet = setupPager(linksCnt, offset);
        // Начальное отображение, далее вызовы функций зацикливаются
        renderTableState(currentPage, entryPerPage);
        // Отрабатываем событие "после инициализации":
        pConfig.onAfterInit && pConfig.onAfterInit(table);
    };
}(this));