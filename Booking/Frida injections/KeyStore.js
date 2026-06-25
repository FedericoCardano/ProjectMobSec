Java.perform(function() {

    console.log();
    
    var KeyStore = Java.use("java.security.KeyStore");
    var OriginalGetKey = KeyStore.getKey;  
    KeyStore.getKey.overload('java.lang.String','[C').implementation = function(alias, password) {
        console.log("[*] getKey called with alias:", alias);
        var key = OriginalGetKey.call(this, alias, password);
        console.log("[*] Key class: " + key.$className);
        console.log("[*] Key: " + key.getEncoded());
        console.log("[*] Key algorithm:", key.getAlgorithm());
        console.log("[*] Key format:", key.getFormat());
        console.log();
        return key;
    }

    var OriginalGetCertificate = KeyStore.getCertificate;
    var OpenSSLECPublicKey = Java.use("org.conscrypt.OpenSSLECPublicKey");
    var OpenSSLRSAPublicKey = Java.use("com.android.org.conscrypt.OpenSSLRSAPublicKey");
    KeyStore.getCertificate.overload('java.lang.String').implementation = function(alias) {
        console.log("[*] getCertificate called with alias:", alias);
        var Certificate = OriginalGetCertificate.call(this, alias);
        console.log("[*] Certificate:", Certificate);
        var PublicKey = Certificate.getPublicKey();
        var PublicKeyType = PublicKey.$className;
        console.log("[*] Public Key class:", PublicKeyType);
        if (PublicKeyType.includes("EC")) {
            var ecKey = Java.cast(PublicKey, OpenSSLECPublicKey);
            console.log("[*] Public Key:", bytesToHex(ecKey.getEncoded()) + "\n");
        }
        else if (PublicKeyType.includes("RSA")) {
            var ecKey = Java.cast(PublicKey, OpenSSLRSAPublicKey);
            console.log("[*] Public Key:", bytesToHex(ecKey.getEncoded()) + "\n");
        }
        return Certificate;
    }


    var Signature = Java.use("java.security.Signature");
    Signature.initSign.overload('java.security.PrivateKey').implementation = function(key) {
        console.log("[*] initSign called with key class: " + key.$className + "");
        return this.initSign(key);
    }

    Signature.sign.overload().implementation = function() {
        var signedData = this.sign();
        console.log("[*] Signature bytes (Hex):", bytesToHex(signedData));
        console.log("[*] Signature bytes length:", signedData.length + "\n");
        return signedData;
    }

    var OriginalSignatureUpdate = Signature.update;
    Signature.update.overload('[B').implementation = function(data) {

        console.log("[*] Signature update detected.");
        var HEXdata = bytesToHex(data);
        console.log("[*] Data (hex):", HEXdata);
        var ASCIIdata = hexToAscii(HEXdata);
        console.log("[*] Data (ASCII preview):", ASCIIdata, "\n");

        return OriginalSignatureUpdate.call(this, data);
    }

    function bytesToHex(byteArray) {
        return Array.from(byteArray, function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }

    function hexToAscii(hex) {
        var str = '';

        for (var i = 0; i < hex.length; i += 2) {

            var code = parseInt(hex.substr(i, 2), 16);

            if (code >= 32 && code <= 126) {
                str += String.fromCharCode(code);
            } else {
                str += '.';
            }
        }

        return str;
    }


    var Builder = Java.use("com.booking.identity.session.internal.DPoPEncryptor$Builder");
    var OriginalGenerateKeyPair = Builder.generateKeyPair;
    Builder.generateKeyPair.overload('long', 'java.lang.String', 'java.lang.String', 'java.lang.String').implementation = function() {
        console.log("[*] Generating new KeyPair");
        var kp = OriginalGenerateKeyPair.call(this);
        console.log("[*] KeyPair class :" + kp.$className + "\n");
        return kp;
    }

});