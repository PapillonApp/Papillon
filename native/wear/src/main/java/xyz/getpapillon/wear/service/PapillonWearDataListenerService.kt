package xyz.getpapillon.wear.service

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService
import xyz.getpapillon.wear.data.WearRepository
import java.nio.charset.StandardCharsets

class PapillonWearDataListenerService : WearableListenerService() {
    override fun onDataChanged(dataEvents: DataEventBuffer) {
        super.onDataChanged(dataEvents)
        for (event in dataEvents) {
            if (event.type == DataEvent.TYPE_CHANGED &&
                event.dataItem.uri.path == WearRepository.PATH_SYNC_DATA
            ) {
                val dataMap = DataMapItem.fromDataItem(event.dataItem).dataMap
                val payloadJson = dataMap.getString("payload")
                if (!payloadJson.isNullOrBlank()) {
                    WearRepository.updateFromJson(applicationContext, payloadJson)
                }
            }
        }
    }

    override fun onMessageReceived(messageEvent: MessageEvent) {
        super.onMessageReceived(messageEvent)
        if (messageEvent.path == WearRepository.PATH_SYNC_PUSH) {
            val payloadJson = String(messageEvent.data, StandardCharsets.UTF_8)
            if (payloadJson.isNotBlank()) {
                WearRepository.updateFromJson(applicationContext, payloadJson)
            }
        }
    }
}
