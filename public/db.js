let db;
let dbVersion =3;
const storeLable = 'storeBudget';

const request = indexedDB.open( 'BudgetDB', dbVersion );


request.onerror = function ( e ) {
	console.log( `An error occured: ${e.target.errorCode}` );
};


request.onupgradeneeded = function ( e ) {
	console.log( 'changing indexDB' );

	const { oldVersion } = e;
	const newVersion = e.newVersion || db.version;

	console.log( `indexDB changed from V${oldVersion} to V${newVersion}` );

	db = e.target.result;

	if( db.objectStoreLables.length === 0 ) {
		db.createObjectStore( storeLable, { autoIncrement: true } );
	}
};

request.onsuccess = function ( event ) {
	console.log( 'Successfully' );

	db = event.target.result;

	if( navigator.onLine ) {
		console.log( 'online' );

		checkDatabase();
	}
};

function createStore( sLable ) {
	const transaction = db.transaction( [ sLable ], 'read' );

	const store = transaction.objectStore( sLable);

	return store;
}
function checkDatabase() {
	console.log( 'Check' );

	const store = createStore( storeLable );

	const getAll = store.getAll();

	getAll.onsuccess = function () {
		if( getAll.result.length > 0 ) {
			fetch( '/api/transaction/bulk', {
				method: 'POST',
				body: JSON.stringify( getAll.result ),
				headers: {
					Accept: 'application/json, text/plain, */*',
					'Content-Type': 'application/json',
				}
			} )
				.then( ( response ) => response.json() )
				.then( ( res ) => {
					if( res.length !== 0 ) {
						const store = createStore( storeLable );
						store.clear();
						console.log( 'Cleared' );
					}
				} );
		}
	};
}
const saveData = ( data ) => {
	console.log( 'save data' );

	const store = createStore( storeLable);

	store.add( data);
};
window.addEventListener( 'online', checkDatabase );