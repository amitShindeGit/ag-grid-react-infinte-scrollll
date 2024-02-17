import React, { useCallback, useState } from "react";
import { AgGridReact } from "ag-grid-react"; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

const Table = () => {
  const limit = 20;
  // Column Definitions: Defines & controls grid columns.
  const [colDefs, setColDefs] = useState([
    {
      field: "make",
      cellRenderer: (props) => {
        if (props?.value !== undefined) {
          return props.value;
        } else {
          return <p>Fetching data...</p>;
        }
      },
    },
    { field: "model" },
    { field: "price" },
    { field: "electric" },
  ]);

  const onGridReady = useCallback(async (params) => {
    let data = await fetch(`{url}/list?page=1&limit=${limit}`);

    data = await data.json();

    const dataSource = {
      rowCount: undefined,
      getRows: async (params) => {
        const currentPageNumber = Math.floor(params.endRow / limit);
        let lastRow = -1;
        let list = data;

        if (currentPageNumber !== -1) {
          let nextPageData = await fetch(
            `{url}/list?page=${currentPageNumber}&limit=${limit}`
          );
          nextPageData = await nextPageData.json();

          list = nextPageData;
        }

        if (list?.length < limit) {
          lastRow = params?.startRow + list?.length;
        }

        list?.length
          ? params.successCallback(list, lastRow)
          : params.failCallback();
      },
    };
    params.api.setGridOption("datasource", dataSource);
  }, []);

  return (
    <div className="ag-theme-quartz" style={{ height: 400 }}>
      <AgGridReact
        columnDefs={colDefs}
        onGridReady={onGridReady}
        cacheBlockSize={limit}
        rowModelType="infinite"
      />
    </div>
  );
};

export default Table;
