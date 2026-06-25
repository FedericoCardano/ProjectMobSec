Java.perform(function() {

    var YELLOW = "\x1b[33m";
    var RESET = "\x1b[0m";
    console.log();

    var Exception = Java.use("java.lang.Exception");
    var Log = Java.use("android.util.Log");
    var DPoPEncryptor = Java.use("com.booking.identity.session.internal.DPoPEncryptor");
    var OriginalGetDPoP = DPoPEncryptor.getDPoP;
    DPoPEncryptor.getDPoP.implementation = function(j, htm, htu, str) {
        console.log("[***] Stack trace DPoP");
        console.log(Log.getStackTraceString(Exception.$new()));

        console.log("[***] DPoP getter inputs");
        console.log("J: " + j);
        console.log("HTM: " + htm);
        console.log("HTU: " + htu);
        console.log("ATH: " + str);

        // Tampering inputs
        var NEW_j = j + 67;
        var NEW_htu = htu + "/67";
        var NEW_htm = "";
        if (htm == "GET")
            NEW_htm = "POST";
        else
            NEW_htm = "GET";
        console.log(YELLOW + "[***] Tampering DPoP inputs");
        console.log("Switching J time offset from " + j + " to " + NEW_j);
        console.log("Switching URL from " + htu + " to " + NEW_htu);
        console.log("Switching URL from " + htm + " to " + NEW_htm + RESET);


        var DPoP = OriginalGetDPoP.call(this, j , htm, htu, str);
        var TamperedDPoP = OriginalGetDPoP.call(this, NEW_j , NEW_htm, NEW_htu, str);

        // Test: invalidating DPoP
        // TamperedDPoP = TamperedDPoP + "AAAA";

        console.log("[***] DPoP: \n" + DPoP);
        console.log("[***] Tampered DPoP: \n" + TamperedDPoP);


        return DPoP;

        // https://account.booking.com/api/identity/authenticate/v1.0/context/initialize?notification_auth_status=1
    }



    var TokenState = Java.use("com.booking.identity.session.internal.TokenState");
    var OriginalGetToken = TokenState.getAccessToken$session_release;

    TokenState.getAccessToken$session_release.overload('java.lang.String', 'boolean').implementation = function (urlPath, z) {

        console.log("[***] getAccessToken()");
        console.log("  url: " + urlPath);
        console.log("  forceRefresh: " + z);

        var token = OriginalGetToken.call(this, urlPath, z);

        if (token != null) {
            try {
                console.log("  token.type: " + token.type);
                console.log("  token.hash: " + token.hash);
                console.log("  token.value: " + token.value);
            } catch (e) {
                console.log("  token inspect error: " + e);
            }
        } else {
            console.log("  token = NULL");
        }

        return token;
    };



    var SessionInterceptor = Java.use("com.booking.identity.session.SessionInterceptor");
    var OriginalInterceptor = SessionInterceptor.intercept;
    var Request = Java.use("okhttp3.Request");

    SessionInterceptor.intercept.implementation = function (chain) {

        console.log("[***] REQUEST INTERCEPT START");

        var request = chain.request();
        request = Java.cast(request, Request);
        console.log("(1) Request:", request);
        // console.log(Request.class.getDeclaredMethods());
        var url = request.url();
        var method = request.method();

        console.log("(2) URL: " + url);
        console.log("(3) Method: " + method);

        var response = OriginalInterceptor.call(this, chain);
        // console.log(response.class.getDeclaredMethods());
        console.log("(4) Response code: " + response.code());

        var body = SessionInterceptor.getSnapshot(response.peekBody(100000));
        console.log("(5) Response body (first 100KB):\n", body);

        console.log("(6) DPoP sent:", request.header("DPoP"));
        console.log("(7) Authorization:", request.header("Authorization"));

        return response;
    };

    var OriginalAddDPoPHeader = SessionInterceptor.addDPoPHeader;
    SessionInterceptor.addDPoPHeader.implementation = function(builder, request, offset) {

        console.log("addDPoPHeader()");
        console.log("URL: " + request.url());
        console.log("Method: " + request.method());

        return OriginalAddDPoPHeader.call(this, builder, request, offset);
    };

    var RequestBuilder = Java.use("okhttp3.Request$Builder");
    var OriginalHeader = RequestBuilder.header;
    RequestBuilder.header.overload('java.lang.String', 'java.lang.String').implementation = function(name, value) {

        if (name == "DPoP") // || name == "Authorization" || name == "X-Access-Token" || name == "X-Booking-Iam-Access-Token") 
        {
            console.log("[HEADER okhttp3]");
            console.log(name + ": \n" + value);
        }

        return OriginalHeader.call(this, name, value);
    };

    /*
    Prova a vedere se posso firmare un DPoP modificato con la stessa Private Key oppure se riesco a pescare da qualche altra parte 
    un'altra Private Key non protetta da password.
    */

});