import { 
    itemsData,
    setItemsData,
    setFilter,
    filter,
    csvData,
    setCsvData,
    filter1,
    setFilter1,
    localView,
    setLocalView
} from "../signals/signals";
import { onMount, createMemo } from 'solid-js'
import Papa from 'papaparse'
import JsBarcode from "jsbarcode";

function Landing() {

  onMount(() => {
    fetch('/Locations.csv')
      .then(response => response.text())
      .then(text => {
        Papa.parse(text, {
          header: false, // Set to false since your CSV does not have a header row
          skipEmptyLines: true,
          complete: function(results) {
            // Assuming each row corresponds to ['location', 'cdcode']
            const parsedData: any = results.data.map((row: any) => ({
              location: row[0],
              cdcode: row[1]
            }));
            setCsvData(parsedData);
          }
        });
      });
    fetch('/ItemLocations.csv')
      .then(response => response.text())
      .then(text => {
        Papa.parse(text, {
          header: false,
          skipEmptyLines: true,
          complete: function(results) {
            const parsedData: any = results.data.map((row: any) => ({
              location: row[0],
              item: row[1],
              pallets: row[2],
              maxPallets: row[3],
              plantZone: row[4]
            }))
            setItemsData(parsedData)
            console.log(parsedData)
          }
        })
      });
  });

  const filteredData = createMemo(() =>
    csvData().filter((row: any) =>
      row.location.toLowerCase().includes(filter().toLowerCase())
    )
  );

  const filteredLocations = createMemo(() => 
    itemsData().filter((row: any) => 
      row.item.toLowerCase().includes(filter().toLowerCase())
    )
    .sort((a: any, b: any) => {
      // First, sort by item (part number)
      let s = filter()[0]
      if (s == 'e') {
        const aLocParts = a.location.split('-');
        const bLocParts = b.location.split('-');

        // Parse the parts of the location strings
        const aLocFirstNum = parseInt(aLocParts[0], 10);
        const bLocFirstNum = parseInt(bLocParts[0], 10);

        const aLocLetter = aLocParts[1];
        const bLocLetter = bLocParts[1];

        const aLocSecondNum = parseInt(aLocParts[2], 10);
        const bLocSecondNum = parseInt(bLocParts[2], 10);

        // First compare the first numeric part
        if (aLocFirstNum !== bLocFirstNum) {
          return aLocFirstNum - bLocFirstNum;
        }
        /*
        // If the first numeric parts are the same, compare the letter
        if (aLocLetter !== bLocLetter) {
          return aLocLetter.localeCompare(bLocLetter);
        }
        */
        // Finally, compare the second numeric part
        return aLocSecondNum - bLocSecondNum;
      } 
      if (a.item < b.item) return -1;
      if (a.item > b.item) return 1;
      
      // If the part numbers are the same, sort by pallets (high to low)
      return b.pallets - a.pallets;
    })
  );

  const handleChange = ({target: {value}}: any) => {
    setFilter(value)
  }

  const changeView = () => {
    if (localView() === 'cd') {
      setLocalView('items')
      setFilter('')
    } else {
      setLocalView('cd')
      setFilter('')
    }
  }


  const renderLocations: any = () => {
    return filteredData().map((row: any) => (
      <tr>
        <td style="text-align: center">{row.location}</td>
        <td style="text-align: center">{row.cdcode}</td>
      </tr>
    ));
  };

  const renderBarCodes = () => {
    return filteredData().map((row: any) => (
      <tr key={row.cdcode}>
        <td style="text-align: center">
          <svg
            id={`barcode1-${row.location}`}  // Ensure unique ID
            ref={(el) => {
              if (el) {
                JsBarcode(el, row.location, {
                  format: "CODE128",
                  lineColor: "#000",
                  width: 3,
                  height: 70,
                  displayValue: true
                });
              }
            }}
          ></svg>
        </td>
        <td style="text-align: center">
          <svg
            id={`barcode2-${row.cdcode}`} // Ensure unique ID
            ref={(el) => {
              if (el) {
                JsBarcode(el, row.cdcode, {
                  format: "CODE128",
                  lineColor: "#000",
                  width: 3,
                  height: 70,
                  displayValue: true
                });
              }
            }}
          ></svg>
        </td>
      </tr>
    ));
  };

  const renderLocPal: any = () => {
    return filteredLocations().map((row: any) => (
      <tr key={row.location}>
        <td style="text-align: center">
          {row.location}
        </td>
        <td style="text-align: center">
          {row.item}
        </td>
        <td style="text-align: center">
          {row.pallets}
        </td>
        <td style="text-align: center">
          {row.maxPallets}
        </td>
        <td style="text-align: center">
          {row.plantZone}
        </td>
      </tr>
    ));
  };

  const renderItemLoc = () => {
    return(
      <>
        <h1 style={{'text-align': 'center'}}><a onClick={() => changeView()}>Item Locations</a></h1>
        <input style={'text-align: center; width: 30vw;'} type='text' id='filter' onInput={handleChange} value={filter()} />
        <table>
          <thead>
            <tr>
              <th style="text-align: center">Location</th>
              <th style="text-align: center">Item</th>
              <th style="text-align: center"># Pallets</th>
              <th style="text-align: center">Max Pallets</th>           
              <th style="text-align: center">Plant</th>           
            </tr>
          </thead>
          <tbody>
            {renderLocPal()}
          </tbody>
        </table>
      </>
    )
  }

  const renderCDLoc = () => {
    return(
      <>
        <h1 style={{'text-align': 'center'}}><a onClick={() => changeView()}>Locations</a></h1>
        <input style={'text-align: center; width: 30vw;'} type='text' id='filter' onInput={handleChange} value={filter()} />
        <table>
          <thead>
            <tr>
              <th style="text-align: center">Location</th>
              <th style="text-align: center">CD Code</th>
            </tr>
          </thead>
          <tbody>
            {filteredData().length < 50 ? renderBarCodes() : renderLocations()}
          </tbody>
        </table>
      </>
    )
  }
  
    return(
      <div class='container'>
        {localView() === 'cd' ? renderCDLoc() : renderItemLoc()}
      </div>
    )
  }



export default Landing