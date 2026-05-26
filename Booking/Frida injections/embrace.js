Java.perform(function() {
    var FactoryClass = Java.use("com.booking.observability.di.ObservabilityModule_ProvideTelemetryTrackerFactory");
    var InstanceFactory = Java.use("dagger.internal.InstanceFactory");
    var SQLiteDatabase = Java.use("android.database.sqlite.SQLiteDatabase");


    SQLiteDatabase.rawQuery.overload('java.lang.String', '[Ljava.lang.String;')
    .implementation = function (query, args) {

        var appContext = Java.use("android.app.ActivityThread").currentApplication().getApplicationContext();
        var contextFactory = InstanceFactory.$new(appContext);
        var factory = FactoryClass.$new(contextFactory);
        var tracker = factory.get();
        console.log("Tracker creato:", tracker);

        return this.rawQuery(query, args);
    };

    var ObservabilityExperiments = Java.use("com.booking.observability.ObservabilityExperiments");
    var ObservabilityExperimentsExtKt = Java.use("com.booking.observability.ObservabilityExperimentsExtKt");
    var EMBRACE = ObservabilityExperiments.android_acc_observability_tracker_embrace.value;

    ObservabilityExperimentsExtKt.getVariant.overload("com.booking.observability.ObservabilityExperiments")
    .implementation = function(experiment) {

        // if (experiment.equals(EMBRACE))
            console.log("[Frida] Forzo a 1");
            return 1;
        
    };
});