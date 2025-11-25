package com.habitflow.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable third-party cookies for cross-site auth (localhost vs 10.0.2.2)
        android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(this.bridge.getWebView(), true);
    }
}
