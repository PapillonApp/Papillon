package xyz.getpapillon.wear.data

import android.content.ComponentName
import android.content.Context
import androidx.wear.tiles.TileService
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceUpdateRequester
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONObject
import xyz.getpapillon.wear.complication.NextCourseComplicationService
import xyz.getpapillon.wear.model.WearSyncPayload
import xyz.getpapillon.wear.tile.NextCourseTileService
import java.nio.charset.StandardCharsets

object WearRepository {
    const val PATH_SYNC_DATA = "/papillon/sync"
    const val PATH_SYNC_PUSH = "/papillon/sync_push"
    const val PATH_REQUEST_SYNC = "/papillon/request_sync"
    const val PATH_TOGGLE_HOMEWORK = "/papillon/toggle_homework"

    private const val PREFS_NAME = "papillon_wear_store"
    private const val KEY_PAYLOAD_JSON = "payload_json"

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val _payload = MutableStateFlow(WearSyncPayload.emptyPlaceholder())
    val payload: StateFlow<WearSyncPayload> = _payload.asStateFlow()

    @Volatile
    private var initialized = false

    fun ensureLoaded(context: Context): WearSyncPayload {
        if (!initialized) {
            val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val raw = prefs.getString(KEY_PAYLOAD_JSON, null)
            val parsed = WearSyncPayload.fromJsonString(raw)
            if (parsed != null) {
                _payload.value = parsed
            }
            initialized = true
            pullFromDataLayer(context.applicationContext)
        }
        return _payload.value
    }

    fun updateFromJson(context: Context, payloadJson: String) {
        val parsed = WearSyncPayload.fromJsonString(payloadJson) ?: return
        context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_PAYLOAD_JSON, payloadJson)
            .apply()
        _payload.value = parsed
        notifySurfaces(context.applicationContext)
    }

    fun pullFromDataLayer(context: Context) {
        scope.launch {
            runCatching {
                val dataItems = Tasks.await(Wearable.getDataClient(context).getDataItems())
                dataItems.use { buffer ->
                    for (item in buffer) {
                        if (item.uri.path == PATH_SYNC_DATA) {
                            val dataMap = DataMapItem.fromDataItem(item).dataMap
                            val raw = dataMap.getString("payload")
                            if (!raw.isNullOrBlank()) {
                                updateFromJson(context, raw)
                            }
                        }
                    }
                }
            }
        }
    }

    fun requestSyncFromPhone(context: Context) {
        pullFromDataLayer(context.applicationContext)
        scope.launch {
            runCatching {
                val nodes = Tasks.await(Wearable.getNodeClient(context).connectedNodes)
                val messageClient = Wearable.getMessageClient(context)
                val bytes = "sync".toByteArray(StandardCharsets.UTF_8)
                for (node in nodes) {
                    Tasks.await(messageClient.sendMessage(node.id, PATH_REQUEST_SYNC, bytes))
                }
            }
        }
    }

    fun toggleHomeworkOnPhone(context: Context, homeworkId: String, isDone: Boolean) {
        val current = _payload.value
        val updatedHomework = current.homework.map { item ->
            if (item.id == homeworkId) item.copy(isDone = isDone) else item
        }
        _payload.value = current.copy(homework = updatedHomework)

        scope.launch {
            runCatching {
                val json = JSONObject().apply {
                    put("homeworkId", homeworkId)
                    put("isDone", isDone)
                }.toString()
                val bytes = json.toByteArray(StandardCharsets.UTF_8)
                val nodes = Tasks.await(Wearable.getNodeClient(context).connectedNodes)
                val messageClient = Wearable.getMessageClient(context)
                for (node in nodes) {
                    Tasks.await(messageClient.sendMessage(node.id, PATH_TOGGLE_HOMEWORK, bytes))
                }
            }
        }
    }

    private fun notifySurfaces(context: Context) {
        runCatching {
            TileService.getUpdater(context).requestUpdate(NextCourseTileService::class.java)
        }
        runCatching {
            ComplicationDataSourceUpdateRequester.create(
                context,
                ComponentName(context, NextCourseComplicationService::class.java)
            ).requestUpdateAll()
        }
    }
}
