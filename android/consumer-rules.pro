# Keep all classes in the io.linkrunner package
-keep class io.linkrunner.** { *; }

# Keep all field and method names for proper SDK functionality
-keepclassmembernames class io.linkrunner.sdk.** { *; }

# Keep all interfaces in the io.linkrunner package
-keep interface io.linkrunner.** { *; }

# Keep all enums in the io.linkrunner package
-keep enum io.linkrunner.** { *; }

# Keep enum methods for proper serialization (required for SDK enums)
-keepclassmembers enum io.linkrunner.sdk.** {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep all annotations in the io.linkrunner package
-keep @interface io.linkrunner.** { *; }

# Keep all public and protected methods and fields
-keepclassmembers class io.linkrunner.** {
    public *;
    protected *;
}

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep all React Native module methods (those with @ReactMethod annotation)
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}

# Keep all Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep all Serializable implementations
-keep class * implements java.io.Serializable {
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep R8 rules for SDK consumers
-keep class io.linkrunner.R$* {
    public static <fields>;
}

# Keep BuildConfig
-keep class io.linkrunner.BuildConfig { *; }

# Keep all model classes
-keep class io.linkrunner.sdk.models.** { *; }

# Keep all utils classes
-keep class io.linkrunner.utils.** { *; }

# ===========================================
# GSON SERIALIZATION SUPPORT
# ===========================================

# Keep essential attributes for JSON serialization
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes EnclosingMethod
-keepattributes InnerClasses

# Gson specific classes - required for TypeToken to work
# This is critical for the LinkRunner SDK's WorkManager data deserialization
-keep class com.google.gson.reflect.TypeToken { *; }
-keep class * extends com.google.gson.reflect.TypeToken
-keep public class * implements java.lang.reflect.Type

# Keep Gson internal classes to prevent any serialization issues with R8
-keep class com.google.gson.internal.** { *; }

# Keep @SerializedName annotated fields (SDK scope only)
-keepclassmembers class io.linkrunner.sdk.** {
    @com.google.gson.annotations.SerializedName <fields>;
}

# ===========================================
# KOTLIN METADATA (SDK-SCOPED ONLY)
# ===========================================

# Keep Kotlin metadata for SDK classes
-keep class kotlin.Metadata { *; }

# Keep Kotlin data class methods for SDK classes
-keepclassmembers class io.linkrunner.sdk.** {
    public ** component*();
    public ** copy(...);
} 