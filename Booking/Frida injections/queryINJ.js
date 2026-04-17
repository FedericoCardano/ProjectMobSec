Java.perform(function () {

    var SQLiteDatabase = Java.use("android.database.sqlite.SQLiteDatabase");

    var rawQueryOriginal = SQLiteDatabase.rawQuery.overload(
        'java.lang.String',
        '[Ljava.lang.String;'
    );

    var compileStatementOriginal = SQLiteDatabase.compileStatement.overload('java.lang.String');

    function dumpNewQuery(Caller, newQuery)
    {
        const green = "\x1b[32m";
        const reset = "\x1b[0m";

        console.log(`\n${green}[DUMP TRIGGERED]`);
        console.log("DB Path: " + Caller.getPath());

        try {
            var dumpCursor = rawQueryOriginal.call(
                Caller,
                newQuery,
                null
            );

            console.log("\n[DUMP QUERY]: " + newQuery)

            var columns = dumpCursor.getColumnNames();
            var value, row, type;
            var rowCount = 0;

            while (dumpCursor.moveToNext()) {

                row = "";

                for (var i = 0; i < columns.length; i++) {
                    
                    type = dumpCursor.getType(i);

                    switch (type) {
                        case 0: value = "NULL"; break;
                        case 1: value = dumpCursor.getInt(i); break;
                        case 2: value = dumpCursor.getFloat(i); break;
                        case 3: value = dumpCursor.getString(i); break;
                        case 4: value = "<BLOB>"; break;
                    }

                    row += columns[i] + "=" + value;
                    if (i != columns.length - 1)
                        row += " | ";
                }

                rowCount++;
                console.log("\nRow #" + rowCount + ": " + row);
            }

            if (rowCount == 0) {
                console.log("[WARNING]: The dumped table has 0 rows. Showing the columns instead.");
                console.log("[COLUMNS]: " + columns);
            }

            dumpCursor.close();

        } catch (e) {
            console.log("[ERROR]: Dump error: " + e);
        }

        console.log(`${reset}`);
    }

    SQLiteDatabase.rawQuery.overload(
        'java.lang.String',
        '[Ljava.lang.String;'
    ).implementation = function (query, args) {
        /*
        // Showing the original raw query
        console.log("[RAW QUERY]: " + query);
        
        // Trigger condition
        if (query.includes("transport_contexts")) 
            dumpNewQuery(this, "SELECT * FROM sqlite_master");
        else */
            console.log();
        
        // Remember to execute the original query as well
        return rawQueryOriginal.call(this, query, args);
    };


    SQLiteDatabase.compileStatement.overload('java.lang.String')
    .implementation = function (sql) {
        
        // Show the original query
        console.log("\n[COMPILE STATEMENT]");
        console.log("SQL: " + sql);
        
        // Trigger condition
        if (sql.includes("PRAGMA")) 
            dumpNewQuery(this, "SELECT * FROM sqlite_master");
        else
            console.log();

        // Remember to execute the original prepared statement
        return compileStatementOriginal.call(this, sql);
    };
});