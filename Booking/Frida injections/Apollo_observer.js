
Java.perform(function () {

    var store = {};
    var threadMap = {};

    function logApolloRequests() {
        console.log("\n============ APOLLO REQUESTS LOG ============");

        var NumberOfKeys = Object.keys(store).length;

        if (NumberOfKeys === 0) {
            console.log("\nStore is empty. There are no requests.");
            console.log("\n========== APOLLO REQUESTS LOG END ==========\n");
            return;
        }

        let count = 0;

        for (var uuid in store) {
            count++;
            console.log("\nUUID: " + store[uuid].UUID);
            console.log("\nClass:", store[uuid].class);
            console.log("\nQuery:", store[uuid].query);
            console.log("\nHeaders:", JSON.stringify(store[uuid].headers, null, 2));
            console.log("\nResponse:", store[uuid].response);
            console.log();
            console.log("\nHTTP OP:", store[uuid].httpOP);
            console.log("\nHTTP Headers:", JSON.stringify(store[uuid].HTTPheaders, null, 2));
            console.log("\nHTTP Raw JSON:", store[uuid].rawJson);
            console.log();
            console.log("\nNetwork Request:", store[uuid].NetworkRequest);
            if (count < NumberOfKeys)
                console.log("\n--------------------------------------------------");
        }

        console.log("\n========== APOLLO REQUESTS LOG END ==========\n");
    }

    globalThis.logApolloRequests = logApolloRequests;




    var NetworkInterceptor = Java.use("com.apollographql.apollo3.interceptor.NetworkInterceptor");
    var interceptOriginal = NetworkInterceptor.intercept;

    NetworkInterceptor.intercept.implementation = function (request, chain) {

        console.log("\n========== GRAPHQL NETWORK ==========");

        var uuid = request.requestUuid ? request.requestUuid.value.toString() : "unknown";
        console.log("UUID NETWORK: " + uuid);

        try {

            if (!store[uuid]) 
                store[uuid] = {};

            store[uuid].NetworkRequest = request.toString();
            console.log("Request: " + request.toString());
        } catch (e) {}

        var flow = interceptOriginal.call(this, request, chain);

        return flow;
    };




    var Req = Java.use("com.apollographql.apollo3.api.ApolloRequest");
    var OriginalReqInit = Req.$init;

    Req.$init.overload(
        "com.apollographql.apollo3.api.Operation",
        "java.util.UUID",
        "com.apollographql.apollo3.api.ExecutionContext",
        "java.util.List"
    ).implementation = function (op, uuid, ctx, headers) {

        console.log("\n========== APOLLO REQUEST CREATED ==========");

        var UUID = uuid.toString();

        if (!store[UUID])
            store[UUID] = {};

        try {
            store[UUID].UUID = UUID;
            console.log("UUID: " + UUID);
        } catch (e) {}

        try {
            store[UUID].class = op.$className;
            console.log("Operation class: " + op.$className);
        } catch (e) {}

        try {
            store[UUID].query = op.document()
            console.log("\n[GRAPHQL DOCUMENT]");
            console.log("Query:\n" + op.document() + "\n");

        } catch (e) {
            console.log("Error extracting operation: " + e);
        }

        try {

            if (!store[UUID].headers) {
                store[UUID].headers = [];
            }

            var iter = headers.iterator();
            let count = 0;
            while (iter.hasNext()) {

                var h = iter.next();
                count++;

                try {
                    var nameField = h.getClass().getDeclaredField("name");
                    var valueField = h.getClass().getDeclaredField("value");

                    nameField.setAccessible(true);
                    var HeaderName = nameField.get(h).toString();
                    valueField.setAccessible(true);
                    var HeaderValue = valueField.get(h).toString();

                    console.log("Header #" + count + " = " + HeaderName + " : " + HeaderValue);

                    store[UUID].headers.push({
                        name: HeaderName,
                        value: HeaderValue
                    });

                } catch (e) {
                    console.log("Header #" + count + " = " + h.toString());
                    console.log("Warning! Saving as raw header.")

                    store[UUID].headers.push({
                        raw: h
                    });
                }
            }
        } catch (e) {}

        return OriginalReqInit.call(this, op, uuid, ctx, headers);
    };




    var ObjectAdapter = Java.use("com.apollographql.apollo3.api.ObjectAdapter");
    var toJsonOriginal = ObjectAdapter.toJson;

    ObjectAdapter.toJson.implementation = function (writer, adapters, value) {

        var tid = Java.use('java.lang.Thread').currentThread().getId().toString();
        var uuid = threadMap ? threadMap[tid] : null;

        if (value.$className.includes("$Data")) {

            console.log("\n====== GRAPHQL FINAL ======");
            console.log("UUID:", uuid);
            console.log("Response:", value.toString());

            if (uuid && store[uuid]) {
                store[uuid].response = value.toString();
                console.log("Response saved with UUID");
            }
        }

        return toJsonOriginal.call(this, writer, adapters, value);
    };




    var HT = Java.use("com.apollographql.apollo3.network.http.HttpNetworkTransport");
    var OriginalHTExecute = HT.execute;

    HT.execute.overload(
        "com.apollographql.apollo3.api.ApolloRequest"
    ).implementation = function (request) {

        console.log("\n========== HTTP NETWORK TRANSPORT ==========");

        var reqClass = Java.use("com.apollographql.apollo3.api.ApolloRequest").class;


        try {
            console.log("Request UUID: " + request.requestUuid);
        } catch (e) {}

        var uuidField = reqClass.getDeclaredField("requestUuid");
        uuidField.setAccessible(true);

        var uuid = uuidField.get(request).toString();
        console.log("UUID:", uuid);

        if(!store[uuid])
            store[uuid] = {};

        threadMap[Java.use('java.lang.Thread').currentThread().getId()] = uuid;

        try  {
            console.log("Operation raw:", request.operation);
        } catch (e) {}

        var opField = reqClass.getDeclaredField("operation");
        opField.setAccessible(true);

        var op = opField.get(request);
        console.log("OP CLASS IN HTTP:", op.$className);
        store[uuid].httpOP = op.$className;


        try {
            console.log("Headers: " + request.httpHeaders);
        } catch (e) {}

        var headersField = reqClass.getDeclaredField("httpHeaders");
        headersField.setAccessible(true);

        var headers = headersField.get(request);

        var ArrayList = Java.use("java.util.ArrayList");
        var RealHeaders = Java.cast(headers, ArrayList);

        var it = RealHeaders.iterator();

        if (!store[uuid].HTTPheaders) {
            store[uuid].HTTPheaders = [];
        }

        let count = 0;
        while (it.hasNext()) {

            var h = it.next();
            count++;

            try {
                var nameField = h.getClass().getDeclaredField("name");
                var valueField = h.getClass().getDeclaredField("value");

                nameField.setAccessible(true);
                var HTTPname = nameField.get(h).toString();
                valueField.setAccessible(true);
                var HTTPvalue = valueField.get(h).toString();

                console.log("HTTP header #" + count + " = " + HTTPname + " : " + HTTPvalue);

                store[uuid].HTTPheaders.push({
                    name: HTTPname,
                    value: HTTPvalue
                });

            } catch (e) {
                console.log("HTTP header #" + count + " = " + h.toString());
                console.log("Warning! Saving as raw header.")

                store[uuid].HTTPheaders.push({
                    raw: h
                });
            }
        }

        var response = OriginalHTExecute.call(this, request);

        try {
            var peek = response.peekBody(1024 * 1024);
            store[uuid].rawJson = peek.string();
        } catch (e) {}

        return response;
    };




    var RealCall = Java.use("okhttp3.internal.connection.RealCall");
    var OriginalRealCallMethod = RealCall.getResponseWithInterceptorChain$okhttp;

    
    RealCall.getResponseWithInterceptorChain$okhttp.implementation = function () {

        console.log("\n===== OKHTTP CALL START =====");

        var request = this.request();
        console.log("URL:", request.url().toString());
        console.log("Method:", request.method());

        var headers = request.headers();
        for (var i = 0; i < headers.size(); i++) {
            console.log(headers.name(i) + ": " + headers.value(i));
        }

        var response = OriginalRealCallMethod.call(this);

        console.log("\n===== OKHTTP RESPONSE =====");
        console.log("Code:", response.code());
        console.log("Message:", response.message());

        try {
            console.log("Body:", response.peekBody(1024 * 1024).string());
        } catch (e) {
            console.log("Body error:", e);
        }

        return response;
    };
});


/*
Java.perform(function () {

    var RealCall = Java.use("okhttp3.internal.connection.RealCall");
    var OriginalRealCallMethod = RealCall.getResponseWithInterceptorChain$okhttp;

    
    RealCall.getResponseWithInterceptorChain$okhttp.implementation = function () {

        console.log("\n===== OKHTTP CALL START =====");

        var request = this.request();
        console.log("URL:", request.url().toString());
        console.log("Method:", request.method());

        var headers = request.headers();
        for (var i = 0; i < headers.size(); i++) {
            console.log(headers.name(i) + ": " + headers.value(i));
        }

        var response = OriginalRealCallMethod.call(this);

        console.log("\n===== OKHTTP RESPONSE =====");
        console.log("Code:", response.code());
        console.log("Message:", response.message());

        try {
            console.log("Body:", response.peekBody(1024 * 1024).string());
        } catch (e) {
            console.log("Body error:", e);
        }

        return response;
    };

});
*/