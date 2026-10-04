package com.snowman6.rewrite

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // targetSdk 36: Android 15+에서 엣지투엣지는 강제 — 끄는 것 자체가 무효
    // → 켜둔 채, 시스템바 inset만큼 루트 뷰를 패딩 (상단바/내비게이션바 침범 방지)
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    findViewById<android.view.View>(android.R.id.content)?.let { rootView ->
      // 인셋 스트립(상태바/내비게이션바 영역) 배경 = 앱 bg (#0a0a0a, 모든 테마 동일)
      rootView.setBackgroundColor(android.graphics.Color.parseColor("#0A0A0A"))
      ViewCompat.setOnApplyWindowInsetsListener(rootView) { view, windowInsets ->
        val insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars())
        view.setPadding(view.paddingLeft, insets.top, view.paddingRight, insets.bottom)
        windowInsets
      }
    }
  }
}