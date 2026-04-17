    setTimeout(function () {

    Java.perform(function () {

        var Thread = Java.use("java.lang.Thread");

        var WalletClassPackage = "com.booking.rewardsandwalletservices.data.model";
        var WalletClass = "WalletSummary";
        var WalletAmountStr = WalletClassPackage + "." + WalletClass;

        var WalletAmount = Java.use(WalletAmountStr);
/*
        WalletAmount.toString.implementation = function() {
            console.log("sono dentro");
            return "patatoRosso";
        }; */

        WalletAmount.$init.implementation = function () {
            console.log("Created instance!");

            var stackTrace = Thread.currentThread().getStackTrace();
            console.log("[STACK TRACE]");
            for (var i = 0; i < stackTrace.length; i++) {
                var element = stackTrace[i];
                console.log("#" + (i+1) + " Class: " + element.getClassName() + 
                            " // Method: " + element.getMethodName() + 
                            " // Line: " + element.getLineNumber());    
            }

            return this.$init.apply(this, arguments);
        };


        var MyString = "nullissimo";
        Java.choose(WalletAmountStr, {
            onMatch: function (instance) {
                console.log("Found you...");

                MyString = instance.toString();
                console.log(MyString + "\n");

                var moneyAmount = 67.0;
                console.log("Adding " + moneyAmount + "$ as cash credits\n");
                instance.balance.value.credits.value.cash.value.raw.value += moneyAmount;
                instance.balance.value.credits.value.cash.value.prettified.value = instance.balance.value.credits.value.cash.value.raw.value + " Sylveuro";
                instance.balance.value.credits.value.total.value.raw.value += moneyAmount;
                instance.balance.value.credits.value.total.value.prettified.value = instance.balance.value.credits.value.total.value.raw.value + " Sylveuro";

                // console.log(instance.balance.value.credits.value.cash.value.raw.value);
                console.log(instance.balance.value);
            },
            onComplete: function() {}
        });

        // console.log();
        // console.log(MyString);
        console.log("hai! :3");

 
    });

}, 0);