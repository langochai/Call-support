(function ($) {
    $.fn.scrollTable = function (options) {
        let settings = $.extend({
            rowCount: 0,
            isLoading: false,
            loadMoreRows: async function (tableBody, rowCount) {
                if (!options.fetchData) throw new Error('fetchData is missing');
                if (!options.columns) throw new Error('columns is missing');
                settings.isLoading = true;
                const data = await options.fetchData(rowCount);
                data.forEach(d => {
                    const row = $(`<tr class="${d.rowClass ?? ''}"></tr>`);
                    options.columns.forEach(c => {
                        row.append($(`<td>${d[c]}</td>`));
                    });
                    row.data('data', d)
                    tableBody.append(row);
                });
                rowCount += data.length;
                settings.isLoading = false;
                return rowCount;
            }
        }, options);

        return this.each(async function () {
            const table = $(this);
            const tableContainer = table.closest('.table-container');
            const tableBody = table.find('tbody');
            let lastScrollTop = 0
            async function onScroll() {
                const scrollTop = tableContainer.scrollTop();
                const scrollHeight = tableContainer[0].scrollHeight;
                const clientHeight = tableContainer[0].clientHeight;
                if (scrollTop > lastScrollTop) {
                    if (scrollTop + clientHeight >= scrollHeight - 5 && !settings.isLoading) {
                        settings.rowCount = await settings.loadMoreRows(tableBody, settings.rowCount);
                    }
                }
                lastScrollTop = scrollTop;
            }
            tableContainer.on('scroll.scrollTable', onScroll);

            // Initial load
            settings.rowCount = await settings.loadMoreRows(tableBody, settings.rowCount);
        });
    };

    $.fn.cleanupScrollTable = function () {
        return this.each(function () {
            const table = $(this);
            table.closest('.table-container').off('scroll.scrollTable')
        });
    };
}(jQuery));
