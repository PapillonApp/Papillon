package xyz.getpapillon.wear.bridge

import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService
import org.json.JSONObject
import java.nio.charset.StandardCharsets

class PapillonWearListenerService : WearableListenerService() {
  override fun onMessageReceived(messageEvent: MessageEvent) {
    super.onMessageReceived(messageEvent)

    when (messageEvent.path) {
      PapillonWearModule.PATH_REQUEST_SYNC -> {
        val activeModule = PapillonWearModule.activeInstance
        if (activeModule != null) {
          activeModule.emitWatchSyncRequested()
        } else {
          PapillonWearModule.republishCachedPayload(applicationContext)
        }
      }

      PapillonWearModule.PATH_TOGGLE_HOMEWORK -> {
        val raw = String(messageEvent.data, StandardCharsets.UTF_8)
        runCatching {
          val json = JSONObject(raw)
          val homeworkId = json.optString("homeworkId", "")
          val isDone = json.optBoolean("isDone", false)
          if (homeworkId.isNotEmpty()) {
            PapillonWearModule.activeInstance?.emitWatchToggleHomework(homeworkId, isDone)
          }
        }
      }
    }
  }
}
