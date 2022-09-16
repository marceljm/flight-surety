
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async () => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            if (result)
                jQuery('#operational').text('Operational');
            else
                jQuery('#operational').text('NOT operational');
        });

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let airlineAccount = DOM.elid('airlines-oracle').value;
            let flight = DOM.elid('flights-oracle').value;
            jQuery('#spinner').show();
            jQuery('#flight-status').hide();
            jQuery('#flight-status').text('');
            // Write transaction
            contract.fetchFlightStatus(airlineAccount, flight, (error, result) => {
                console.log(result);
                jQuery('#spinner').hide();
                jQuery('#flight-status').show();
                jQuery('#flight-status').text(result['status']);
                // display('Oracles', 'Trigger oracles', [{ label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp }]);
            });
        })

        DOM.elid('submit-purchase').addEventListener('click', () => {
            let airlineAccount = DOM.elid('airlines').value;
            let flightCode = DOM.elid('flights').value;
            let timestamp = contract.timestamp;
            let passengerAccount = DOM.elid('passengers').value;
            let funds = DOM.elid('funds').value;

            if (!passengerAccount || !airlineAccount || !flightCode || !funds || !timestamp)
                return;

            // Write transaction
            contract.buy(airlineAccount, flightCode, timestamp, passengerAccount, funds, (error, result) => {
                console.log(result);
            });
        })

        jQuery('#passengers').append(`<option value=""></option>`);
        for (let i = 0; i < 5; i++) {
            jQuery('#passengers').append(`<option value="${contract.passengers[i]}">${contract.passengersNames[i]}</option>`);
        }

        jQuery('#airlines').append(`<option value=""></option>`);
        for (let i = 0; i < 5; i++) {
            jQuery('#airlines').append(`<option value="${contract.airlines[i]}">${contract.airlinesNames[i]}</option>`);
        }

        jQuery('#airlines').on('change', function () {
            let airline = jQuery('#airlines :selected').text();
            jQuery('#flights').empty();
            for (const flight of contract.airlineFlight[airline]) {
                let city = flight[0];
                let code = flight[1];
                jQuery('#flights').append(`<option value="${code}">${city} (${code})</option>`);
            }
        });

        jQuery('#airlines-oracle').append(`<option value=""></option>`);
        for (let i = 0; i < 5; i++) {
            jQuery('#airlines-oracle').append(`<option value="${contract.airlines[i]}">${contract.airlinesNames[i]}</option>`);
        }

        jQuery('#airlines-oracle').on('change', function () {
            let airline = jQuery('#airlines-oracle :selected').text();
            jQuery('#flights-oracle').empty();
            for (const flight of contract.airlineFlight[airline]) {
                let city = flight[0];
                let code = flight[1];
                jQuery('#flights-oracle').append(`<option value="${code}">${city} (${code})</option>`);
            }
        });
    });

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({ className: 'row' }));
        row.appendChild(DOM.div({ className: 'col-sm-4 field' }, result.label));
        row.appendChild(DOM.div({ className: 'col-sm-8 field-value' }, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}


