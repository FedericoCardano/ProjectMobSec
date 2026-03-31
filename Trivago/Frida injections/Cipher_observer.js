Java.perform(function () {
    // =========================
    // CIPHER INIT HOOK
    // =========================

    var Cipher = Java.use("javax.crypto.Cipher");


    Cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec')
    .implementation = function (mode, key, params) {
        var id = this.hashCode();

        var ivHex = null;

        try {
            var iv = Java.cast(params, Java.use("javax.crypto.spec.IvParameterSpec")).getIV();
            ivHex = toHex(iv);
        } catch (e) {}

        // logging in terminal
        var modeExplicit = (mode == 1) ? "Encryption" :
                        (mode == 2) ? "Decryption" : "Unknown";

        console.log("\n[CIPHER INIT]");
        console.log("Mode: " + mode + " (" + modeExplicit + ")");
        console.log("Key: " + toHex(key.getEncoded()));
        console.log("IV: " + ivHex);

        // Save for later use
        cipherData[id] = {
            mode: mode,
            iv: ivHex,
            key: key.getEncoded ? toHex(key.getEncoded()) : "unknown"
        };

        return this.init(mode, key, params);
    };


    Cipher.updateAAD.overload('[B').implementation = function (aad) {

        var id = this.hashCode();

        if (!cipherData[id]) cipherData[id] = {};
        cipherData[id].aad = toHex(aad);

        return this.updateAAD(aad);
    };

    // =========================
    // CIPHER HOOK
    // =========================
    var Cipher = Java.use("javax.crypto.Cipher");
    var StringClass = Java.use("java.lang.String");

    function isReadable(str) {
        if (!str) {
            // console.log("Not a string.");
            return false;
        }
        // console.log("strLength: " + str.length)
        
        // percentage of printable characters
        var printable = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            if (c >= 32 && c <= 126) printable++;
        }

        var ratio = printable / str.length;
        // console.log("Ratio: " + ratio);

        return ratio > 0.85; // customizable threshold
    }

    function tryBase64Decode(str) {
        try {
            var Base64 = Java.use("android.util.Base64");
            var decoded = Base64.decode(str, 0);
            return StringClass.$new(decoded, "UTF-8").toString();
        } catch (e) {
            return null;
        }
    }

    function toHex(bytes) {
        var hex = "";
        for (var i = 0; i < bytes.length; i++) {
            var b = (bytes[i] & 0xff).toString(16);
            if (b.length === 1) hex += "0";
            hex += b;
        }
        return hex;
    }

    function logCipher(data, result) {
        try {
            var input = StringClass.$new(data, "UTF-8").toString();
            var output = StringClass.$new(result, "UTF-8").toString();

            var inReadable = isReadable(input);
            // console.log("inReadable: " + inReadable)
            var outReadable = isReadable(output);
            // console.log("outReadable: " + outReadable);

            const reset = "\x1b[0m";
            const green = "\x1b[32m";
            const red = "\x1b[31m";
            const yellow = "\x1b[33m";
            const blue = "\x1b[34m";

            // Detect and show a decryption
            if (!inReadable && outReadable) {

                console.log(`${green}[DECRYPT]${reset}`);
                console.log(`${green}IN (cipher): *hidden*${reset}`);
                console.log(`${green}OUT (plaintext): ` + output + `${reset}`);

                var decoded = tryBase64Decode(output);
                if (isReadable(decoded)) {
                    console.log("OUT (base64 decoded): " + decoded);
                }
            }
            // Detect an encryption
            else if (inReadable && !outReadable) {

                console.log(`${blue}[ENCRYPT]${reset}`);
                console.log(`${blue}IN (plaintext): ${reset}` + input);
                console.log(`${blue}OUT (cipher): *hidden*${reset}`);
            }
            else
                console.log(`${yellow}[WARNING] Both input and output are not readable!${reset}`);
        } catch (e) {
                console.log(`${red}[ERROR]${reset} An error occurred: ${e.message}`);
        }
    }

    var cipherData = {};


    Cipher.update.overload('[B').implementation = function (data) {
        
        var id = this.hashCode();
        
        var input = StringClass.$new(data, "UTF-8").toString();
        console.log("[UPDATE] IN (plaintext): " + input);

        var result = this.update(data);

        var output = StringClass.$new(result, "UTF-8").toString();
        console.log("[UPDATE] OUT (cipher): *hidden*");

        console.log("[UPDATE] OUT (cipher) hex: " + toHex(result));

        return result;
    };

    
    Cipher.doFinal.overload('[B').implementation = function (data) {

        var result = this.doFinal(data);

        // Human friendly log
        logCipher(data, result);
    
        var id = this.hashCode();
        var info = cipherData[id];

        if (info) { // if (info.mode == 2) {
            // JSON log 
            console.log(JSON.stringify({
                key: info.key,
                iv: info.iv,
                mode: info.mode,
                aad: info.aad ? info.aad : null,
                input: toHex(data),
                output: toHex(result)
            }));
            console.log("\n");
        }
        else
            console.log("No initialization for this cipher with hash code " + id + "\nSkipping JSON log.\n");

        return result;
    };

});