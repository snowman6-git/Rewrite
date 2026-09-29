package com.snowman6.rewrite

import android.graphics.Color
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    // 3. 상단바 높이만큼 웹뷰 콘텐츠만 아래로 밀어내기 (헤더 겹침 방지)
    findViewById<android.view.View>(android.R.id.content)?.let { rootView ->
      ViewCompat.setOnApplyWindowInsetsListener(rootView) { view, windowInsets ->
        val insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars())
        view.setPadding(view.paddingLeft, insets.top, view.paddingRight, view.paddingBottom)
        windowInsets
      }
    }
  }
}