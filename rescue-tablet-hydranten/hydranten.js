const http = require('https');

const fs = require('fs');

const overpassQuery = `
  [out:json];
  (
    area["de:regionalschluessel"="130725251"]->.amtdoberanland;
    area["de:regionalschluessel"="130725263"]->.amtwarnowwest;
    area["de:regionalschluessel"="130720006006"]->.stadtdoberan;
    (
      node[emergency=fire_hydrant](area.stadtdoberan);
      node[emergency=fire_hydrant](area.amtdoberanland);
      node[emergency=fire_hydrant](area.amtwarnowwest);
    );
  );
  out;
`;

const apiUrl = 'https://overpass-api.de/api/interpreter';

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

const req = http.request(apiUrl, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        // JSON-Daten verarbeiten
        const jsonData = JSON.parse(data);

        // CSV-Header erstellen
        const csvHeader = 'TYPE;GEO_LAT;GEO_LNG;DESCRIPTION\n';

        // CSV-Daten erstellen
        const csvData = jsonData.elements.filter((element) => {
          return element.type == 'node' && element.tags.emergency == 'fire_hydrant'
        }).map((element) => {
          let description = []
          let row = [
            0,
            element.lat,
            element.lon,
          ]
          switch(element.tags['fire_hydrant:type']) {
            case 'underground':
              switch(element.tags['fire_hydrant:diameter']) {
              case '80':
                row[0] = 1
                description = ["Unterflurhydrant (H80)"]
                break;
              case '100':
                row[0] = 2
                description = ["Unterflurhydrant (H100)"]
                break;
              case '125':
                row[0] = 7
                description = ["Unterflurhydrant (H125)"]
                break;
              case '150':
                row[0] = 3
                description = ["Unterflurhydrant (H150)"]
                break;
              case '200':
                row[0] = 8
                description = ["Unterflurhydrant (H200)"]
                break;
              case '250':
                row[0] = 16
                description = ["Unterflurhydrant (H250)"]
                break;
              case '300':
                row[0] = 9
                description = ["Unterflurhydrant (H300)"]
                break;
              case '350':
                row[0] = 18
                description = ["Unterflurhydrant (H350)"]
                break;
              case '400':
                row[0] = 10
                description = ["Unterflurhydrant (H400)"]
                break;
              default:
                row[0] = 1
                description = ["Unterflurhydrant"]
                break;
              }
              break;
            case 'pillar':
              switch(element.tags['fire_hydrant:diameter']) {
              
                case '80':
                  row[0] = 4  
                  description = ["Überflurhydrant (H80)"]
                  break;
                case '100':
                  row[0] = 11  
                  description = ["Überflurhydrant (H100)"]
                  break;
                case '150':
                  row[0] = 12  
                  description = ["Überflurhydrant (H150)"]
                  break;
                case '200':
                  row[0] = 13  
                  description = ["Überflurhydrant (H200)"]
                  break;
                case '250':
                  row[0] = 17  
                  description = ["Überflurhydrant (H250)"]
                  break;
                case '300':
                  row[0] = 14  
                  description = ["Überflurhydrant (H300)"]
                  break;
                case '350':
                  row[0] = 19  
                  description = ["Überflurhydrant (H350)"]
                  break;
                case '400':
                  row[0] = 15  
                  description = ["Überflurhydrant (H400)"]
                  break;

              default:
                row[0] = 4
                description = ["Überflurhydrant"]
                break;
              }
              break;
            case 'pipe':
              row[0] = 6 
              description = ["Zisterne / Sonstiges"]
              break;

            default:
              console.log(element)
              break;


          }

          if (element.tags.description)  description.push(element.tags.description)
          if (element.tags.position == "lane") description.push("Fahrbahn")
          if (element.tags.position == "parking_lot") description.push("Parkbucht")
          if (element.tags.position == "sidewalk") description.push("Bürgersteig")
          if (element.tags.position == "green") description.push("Wiese")

          row[3] = description.join(' - ')

          return row.join(";")
        });

        // CSV-Datei erstellen
        const csvContent = csvHeader + csvData.join('\n');
        fs.writeFileSync('hydranten.csv', csvContent);

        console.log('CSV-Datei wurde erstellt: hydranten.csv');
    });
});

req.on('error', (error) => {
    console.error('Fehler bei der Anfrage:', error);
});

req.write(`data=${encodeURIComponent(overpassQuery)}`);
req.end();