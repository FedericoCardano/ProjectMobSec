/*
    SQLiteDatabase
    
        rawQuery() / execSQL()
            direct SQL

        query() / insert() / update() / delete()
            uses ContentValues
    
        compileStatement()
            SQLiteStatement
                bindString / bindLong / ...
                execute()
*/

Java.perform(function () {

    var SQLiteDatabase = Java.use("android.database.sqlite.SQLiteDatabase");
    var Log = Java.use("android.util.Log");
    var Exception = Java.use("java.lang.Exception");
    // ===============================
    // RAW QUERY OBSERVER (manual SQL)
    // ===============================
    SQLiteDatabase.rawQuery.overload('java.lang.String', '[Ljava.lang.String;')
    .implementation = function (query, args) {

        console.log("\n[RAW QUERY] " + query);

        // STACK TRACE
        console.log("[STACK TRACE]");
        console.log(Log.getStackTraceString(Exception.$new()));


        var cursor = this.rawQuery(query, args);

        try {
            var columns = cursor.getColumnNames();
            var count = cursor.getCount();

            console.log("--> Rows: " + count);

            while (cursor.moveToNext()) {
                var row = "";

                for (var i = 0; i < columns.length; i++) {
                    row += columns[i] + "=" + cursor.getString(i);
                    if (i != columns.length - 1)
                        row += " | ";
                }

                console.log("===> " + row);
            }

            // Reset cursor
            cursor.moveToPosition(-1);

        } catch (e) {
            console.log("Error reading cursor: " + e);
        }

        return cursor;
    };

    // ====================================================
    // execSQL OBSERVER (INSERT/UPDATE/DELETE) (manual SQL)
    // ====================================================
    SQLiteDatabase.execSQL.overload('java.lang.String')
    .implementation = function (sql) {
        console.log("\n[EXEC SQL] " + sql);
        return this.execSQL(sql);
    };

    SQLiteDatabase.execSQL.overload('java.lang.String', '[Ljava.lang.Object;')
    .implementation = function (sql, bindArgs) {
        console.log("\n[EXEC SQL + ARGS] " + sql);
        console.log("Args: " + JSON.stringify(bindArgs));
        return this.execSQL(sql, bindArgs);
    };

    // ======================================
    // query() API OBSERVER (Android API SQL)
    // ======================================
    SQLiteDatabase.query.overload(
        'java.lang.String',
        '[Ljava.lang.String;',
        'java.lang.String',
        '[Ljava.lang.String;',
        'java.lang.String',
        'java.lang.String',
        'java.lang.String'
    ).implementation = function (table, columns, selection, selectionArgs, groupBy, having, orderBy) {

        console.log("\n[QUERY API]");
        console.log("Table: " + table);
        console.log("Columns: " + columns);
        console.log("Where: " + selection);
        console.log("Args: " + selectionArgs);

        return this.query(table, columns, selection, selectionArgs, groupBy, having, orderBy);
    };

    // =================================
    // INSERT OBSERVER (Android API SQL)
    // =================================

    function dumpContentValues(cv) {
        var result = {};

        var keySet = cv.keySet();
        var iterator = keySet.iterator();

        while (iterator.hasNext()) {
            var key = iterator.next();
            var value = cv.get(key);
            result[key] = value;
        }

        return JSON.stringify(result);
    }

    SQLiteDatabase.insert.overload('java.lang.String', 'java.lang.String', 'android.content.ContentValues')
    .implementation = function (table, nullColumnHack, values) {

        console.log("\n[INSERT] Table: " + table);
        console.log("Values: " + dumpContentValues(values));

        return this.insert(table, nullColumnHack, values);
    };

    // =================================
    // UPDATE OBSERVER (Android API SQL)
    // =================================

    SQLiteDatabase.update.overload(
        'java.lang.String',
        'android.content.ContentValues',
        'java.lang.String',
        '[Ljava.lang.String;'
    ).implementation = function (table, values, whereClause, whereArgs) {

        console.log("\n[UPDATE] Table: " + table);
        console.log("Values: " + dumpContentValues(values));
        console.log("Where: " + whereClause);
        console.log("Args: " + whereArgs);

        return this.update(table, values, whereClause, whereArgs);
    };

    // =================================
    // DELETE OBSERVER (Android API SQL)
    // =================================
    SQLiteDatabase.delete.overload('java.lang.String', 'java.lang.String', '[Ljava.lang.String;')
    .implementation = function (table, whereClause, whereArgs) {

        console.log("\n[DELETE] Table: " + table);
        console.log("Where: " + whereClause);
        console.log("Args: " + whereArgs);

        return this.delete(table, whereClause, whereArgs);
    };

    // ==============================================
    // PREPARED STATEMENTS OBSERVER (Android API SQL)
    // ==============================================

    SQLiteDatabase.compileStatement.overload('java.lang.String')
    .implementation = function (sql) {

        console.log("\n[COMPILE STATEMENT]");
        console.log("SQL: " + sql);

        return this.compileStatement(sql);
    };

    // ================================
    // BINDS OBSERVER (Android API SQL)
    // ================================

    var SQLiteStatement = Java.use("android.database.sqlite.SQLiteStatement");

    SQLiteStatement.bindString.overload('int', 'java.lang.String') // Bind String
    .implementation = function (index, value) {

        console.log("[BIND STRING] " + index + " = " + value);
        return this.bindString(index, value);
    };

    SQLiteStatement.bindLong.overload('int', 'long') // Bind long
    .implementation = function (index, value) {

        console.log("[BIND LONG] " + index + " = " + value);
        return this.bindLong(index, value);
    };

    SQLiteStatement.bindDouble.overload('int', 'double') // Bind double
    .implementation = function (index, value) {

        console.log("[BIND DOUBLE] " + index + " = " + value);
        return this.bindDouble(index, value);
    };

    SQLiteStatement.bindNull.overload('int') // Bind null
    .implementation = function (index) {

        console.log("[BIND NULL] " + index);
        return this.bindNull(index);
    };

    SQLiteStatement.execute.overload()
    .implementation = function () {

        console.log("[EXECUTE PREPARED STATEMENT]");
        return this.execute();
    };

});
