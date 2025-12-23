# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor WebView - Keep JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Capacitor plugins
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.* <methods>;
}

# Keep Ionic Native plugins
-keep class org.apache.cordova.** { *; }
-keep class cordova.** { *; }

# WebView debugging (keep for better stack traces)
-keepattributes SourceFile,LineNumberTable
-keepattributes JavascriptInterface
-keepattributes *Annotation*

# Keep custom exceptions for better error reporting
-keep public class * extends java.lang.Exception

# For React/JavaScript optimization
# Note: Commented out - too broad for production
# Uncomment and replace with specific package rules if needed
# -keep class ** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep View classes for XML layouts
-keepclassmembers class * extends android.app.Activity {
   public void *(android.view.View);
}

# Preserve enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable classes
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# AndroidX and Google libraries
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-dontwarn androidx.**

# Firebase (if using push notifications)
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# OkHttp (used by many networking libraries)
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Capacitor specific - preserve Bridge classes
-keep class com.getcapacitor.Bridge { *; }
-keep class com.getcapacitor.PluginHandle { *; }

# Preserve line numbers for debugging production crashes
-renamesourcefileattribute SourceFile
