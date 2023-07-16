package com.nazmi3.todo;

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

import android.widget.Toast;

public class MyModule extends ReactContextBaseJavaModule {

    ReactApplicationContext reactContext;

    MyModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "MyModuleName";
    }

    @ReactMethod
    public void doSomething(String message, int duration) {
        Toast.makeText(reactContext, message, duration);
    }
}