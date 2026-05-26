Java.perform(function() {

    var a = Java.use("com.alipay.sdk.m.l0.a");
    var e = Java.use("com.alipay.sdk.m.l0.e");

    var key = a.a();
    var byteArray = Java.array('byte', key);

    var hexString = '';
    for (var i = 0; i < byteArray.length; i++) {
        var hex = (byteArray[i] & 0xFF).toString(16);
        if (hex.length === 1) hex = '0' + hex;
        hexString += hex;
    }

    console.log("AES key: ", hexString);

    var IV = a.b();
    var byteArray2 = Java.array('byte', IV);

    var hexString2 = '';
    for (var i = 0; i < byteArray2.length; i++) {
        var hex2 = (byteArray2[i] & 0xFF).toString(16);
        if (hex2.length === 1) hex2 = '0' + hex2;
        hexString2 += hex2;
    }

    console.log("AES IV: ", hexString2);

    var cipher = a.a("CiaoCarmelo!1?");
    console.log("Cipher: " + cipher);
    console.log("Plain: " + a.b(cipher));


    var d = Java.use("com.alipay.sdk.m.l0.d");
    var UTDID = d.a();
    console.log("UTDID: ", UTDID);
});