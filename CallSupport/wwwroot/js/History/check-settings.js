var db;
/**
 * Initialize browser database
 * @returns {Promise<void>}
 */
function InitializeDB() {
    return new Promise((resolve, reject) => {
        var request = indexedDB.open('Settings', 1);

        request.onupgradeneeded = function (event) {
            db = event.target.result;
            var objectStore = db.createObjectStore('History', { keyPath: 'username' });
            objectStore.createIndex('username', 'username', { unique: true });
            objectStore.createIndex('from_dep', 'from_dep', { unique: false });
            objectStore.createIndex('to_dep', 'to_dep', { unique: false });
            objectStore.createIndex('lines', 'lines', { unique: false });
            objectStore.createIndex('status', 'status', { unique: false });
            objectStore.transaction.oncomplete = function () {
                resolve();
            };
            objectStore.transaction.onerror = function (e) {
                reject(e.target.error);
            };
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            resolve()
            //console.log('Database opened successfully');
        };

        request.onerror = function (event) {
            console.log('Error opening database:', event.target.error);
            reject()
        };
    })
}

/**
 * Save new settings to DB
 * @param {object} record
 */
async function createRecord(record) {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(['History'], 'readwrite');
        var objectStore = transaction.objectStore('History');
        var request = objectStore.add(record);

        request.onsuccess = function (event) {
            resolve(record);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

/**
 * Get settings of an user
 * @param {string} username
 */
async function readRecord(username) {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(['History']);
        var objectStore = transaction.objectStore('History');
        var request = objectStore.get(username);

        request.onsuccess = function (event) {
            if (request.result) {
                resolve(request.result);
            } else {
                resolve({});
            }
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

/**
 * Update existing settings
 * @param {object} record
 */
async function updateRecord(record) {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(['History'], 'readwrite');
        var objectStore = transaction.objectStore('History');
        var request = objectStore.put(record);

        request.onsuccess = function (event) {
            resolve(record);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

/**
 * Delete settings of an user
 * @param {string} username
 */
async function deleteRecord(username) {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(['History'], 'readwrite');
        var objectStore = transaction.objectStore('History');
        var request = objectStore.delete(username);

        request.onsuccess = function (event) {
            resolve(username);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

//Example:
//createRecord({ username: 'johndoe', from_dep: 'Sales', to_dep: 'Marketing', lines: 'Line 1' });
//readRecord('johndoe');
//updateRecord({ username: 'johndoe', from_dep: 'Sales', to_dep: 'Finance', lines: 'Line 2' });
//deleteRecord('johndoe');