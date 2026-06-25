Java.perform(function() {

    var SecretKeyEntry = Java.use("java.security.KeyStore$SecretKeyEntry");
    var OriginalGetSecretKey = SecretKeyEntry.getSecretKey;
    SecretKeyEntry.getSecretKey.overload().implementation = function() {
        
        var SecretKey = OriginalGetSecretKey.call(this);
        console.log("SecretKey Algorithm:", SecretKey.$className);
        return SecretKey;
    }

    var SK = Java.use("android.security.keystore2.AndroidKeyStoreSecretKey");

    SK.getAlgorithm.implementation = function () {

        var algo = this.getAlgorithm();

        console.log("[*] Algorithm:", algo);

        return algo;
    };

    SK.getFormat.implementation = function () {

        var fmt = this.getFormat();

        console.log("[*] Format:", fmt);

        return fmt;
    };

    SK.getEncoded.implementation = function () {

        console.log("[*] getEncoded called");

        var res = this.getEncoded();

        console.log("[*] Encoded:", res);

        return res;
    };

});